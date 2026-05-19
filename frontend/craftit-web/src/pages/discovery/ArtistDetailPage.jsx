import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArtistBySlug } from '../../services/artistService';
import { getArtistPortfolio, likePortfolioItem, unlikePortfolioItem } from '../../services/portfolioService';
import { getSavedArtists, saveArtist, removeSavedArtist } from '../../services/savedArtistService';
import { createPortraitRequest } from '../../services/portraitRequestService';
import { getArtistReviews } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/ui/Loader';
import { MapPin, Star, Clock, CheckCircle, Award, X, Bookmark, BookmarkCheck, Upload, Heart } from 'lucide-react';
import clsx from 'clsx';

export default function ArtistDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  
  const [likesMap, setLikesMap] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [requestObj, setRequestObj] = useState({
    title: '',
    description: '',
    portrait_style: '',
    budget: '',
    expected_delivery_date: '',
  });
  const [referenceImage, setReferenceImage] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistData, portfolioData] = await Promise.all([
          getArtistBySlug(slug),
          getArtistPortfolio(slug)
        ]);
        setArtist(artistData);
        const sortedPortfolio = [...portfolioData].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        setPortfolio(sortedPortfolio);

        const initialLikes = {};
        sortedPortfolio.forEach(item => {
          initialLikes[item.id] = { count: item.likes_count || 0, isLiked: false };
        });
        setLikesMap(initialLikes);

      } catch (err) {
        console.error(err);
        setError('Artist not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Fetch Reviews after Artist Detail Loads
  useEffect(() => {
    if (!artist?.id) return;
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getArtistReviews(artist.id);

        if (!isMounted) return;

        if (data && Array.isArray(data.results)) {
          setReviews(data.results);
          setNextUrl(data.next);
          setPrevUrl(data.previous);
        } else if (Array.isArray(data)) {
          setReviews(data);
          setNextUrl(null);
          setPrevUrl(null);
        } else {
          setReviews([]);
        }

      } catch (err) {
        if (isMounted) {
          console.error("Failed to load reviews", err);
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [artist?.id]);

  const handleLoadMore = async () => {
    if (!nextUrl || !artist?.id) return;
    setMoreLoading(true);
    try {
      const data = await getArtistReviews(artist.id, nextUrl);
      if (data && Array.isArray(data.results)) {
        setReviews(prev => [...prev, ...data.results]);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
      }
    } catch (err) {
      console.error("Failed to load more reviews", err);
    } finally {
      setMoreLoading(false);
    }
  };

  const handlePrevious = async () => {
    if (!prevUrl || !artist?.id) return;
    setMoreLoading(true);
    try {
      const data = await getArtistReviews(artist.id, prevUrl);
      if (data && Array.isArray(data.results)) {
        setReviews(data.results);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
      }
    } catch (err) {
      console.error("Failed to load previous reviews", err);
    } finally {
      setMoreLoading(false);
    }
  };

  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxImage]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (user?.role === 'CLIENT' && artist?.slug) {
        try {
          const savedList = await getSavedArtists();
          const found = savedList.some(item => item.artist.slug === artist.slug);
          setIsSaved(found);
        } catch (err) {
          console.error("Failed to fetch saved status", err);
        }
      }
    };
    fetchSavedStatus();
  }, [user, artist]);

  const handleSaveToggle = async () => {
    if (!artist) return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await removeSavedArtist(artist.slug);
        setIsSaved(false);
      } else {
        await saveArtist(artist.slug);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save status', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLikeToggle = async (e, itemId) => {
    e.stopPropagation();
    
    const current = likesMap[itemId];
    if (!current) return;

    const isLiking = !current.isLiked;

    setLikesMap(prev => ({
      ...prev,
      [itemId]: {
        isLiked: isLiking,
        count: isLiking ? prev[itemId].count + 1 : Math.max(0, prev[itemId].count - 1)
      }
    }));

    try {
      if (isLiking) {
        await likePortfolioItem(itemId);
      } else {
        await unlikePortfolioItem(itemId);
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
      setLikesMap(prev => ({
        ...prev,
        [itemId]: {
          isLiked: !isLiking,
          count: !isLiking ? prev[itemId].count + 1 : Math.max(0, prev[itemId].count - 1)
        }
      }));
    }
  };

  const handleRequestChange = (e) => {
    setRequestObj(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError(null);

    if (!requestObj.title.trim()) return setRequestError("Title is required.");
    if (!requestObj.description.trim()) return setRequestError("Description is required.");
    if (!requestObj.portrait_style) return setRequestError("Portrait style is required.");
    if (requestObj.budget && Number(requestObj.budget) < 0) return setRequestError("Budget cannot be negative.");
    
    if (requestObj.expected_delivery_date) {
      const selected = new Date(requestObj.expected_delivery_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected <= today) {
        return setRequestError("Expected delivery date must be in the future.");
      }
    }

    setRequesting(true);
    try {
      const payload = new FormData();
      payload.append("artist_slug", artist.slug);
      payload.append("title", requestObj.title);
      payload.append("description", requestObj.description);
      payload.append("portrait_style", requestObj.portrait_style.toLowerCase());

      if (referenceImage) payload.append("reference_image", referenceImage);
      if (requestObj.budget) payload.append("budget", requestObj.budget);
      if (requestObj.expected_delivery_date) payload.append("expected_delivery_date", requestObj.expected_delivery_date);

      await createPortraitRequest(payload);
      setRequestSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/client/requests');
      }, 2000);
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes && typeof errRes === 'object' && !errRes.detail) {
        const firstKey = Object.keys(errRes)[0];
        setRequestError(`${firstKey}: ${errRes[firstKey][0]}`);
      } else {
        setRequestError(errRes?.detail || "Failed to submit request.");
      }
      setRequesting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size={48} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-xl">{error}</div>;
  if (!artist) return null;

  const featuredItem = portfolio.length > 0 ? portfolio[0] : null;
  const standardItems = portfolio.length > 1 ? portfolio.slice(1) : [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 pb-16">
      
      {featuredItem ? (
        <div className="h-64 sm:h-96 w-full relative group cursor-pointer" onClick={() => setLightboxImage(featuredItem.image)}>
          <img src={featuredItem.image} alt={featuredItem.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-bold tracking-widest uppercase">Click to expand</span>
          </div>
        </div>
      ) : (
        <div className="h-64 sm:h-80 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 object-cover" />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="shrink-0 relative">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-3xl bg-white p-2 shadow-sm border border-gray-100">
                <img 
                  src={artist.profile_image || '/api/placeholder/400/400'} 
                  alt={artist.display_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              {artist.is_available_for_commission && (
                <div className="absolute -bottom-2 -right-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Available</span>
                </div>
              )}
            </div>

            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl font-extrabold text-gray-900">{artist.display_name}</h1>
                    {user?.role === 'CLIENT' && (
                      <button 
                        onClick={handleSaveToggle}
                        disabled={saveLoading}
                        className={clsx(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border",
                          isSaved 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                          saveLoading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                         {isSaved ? <BookmarkCheck size={18} className="fill-current" /> : <Bookmark size={18} />}
                         {saveLoading ? (isSaved ? 'Removing...' : 'Saving...') : (isSaved ? 'Saved' : 'Save Artist')}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2 font-medium">
                    <MapPin size={16} />
                    <span>{artist.location}</span>
                    <span className="mx-2">•</span>
                    <Award size={16} />
                    <span>{artist.years_of_experience} Years Experience</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-yellow-50 px-4 py-2 rounded-2xl">
                  <Star size={20} className="text-yellow-500 fill-current" />
                  <span className="text-lg font-bold text-yellow-700">{artist.rating ?? 'New'}</span>
                  {artist.total_reviews > 0 && <span className="text-sm text-yellow-600/70 ml-1">({artist.total_reviews} reviews)</span>}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">About the Artist</h3>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                  {artist.short_bio}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {artist.portrait_styles?.map(style => (
                  <span key={style} className="px-4 py-2 bg-indigo-50/50 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-100">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Work</h2>
          
          {portfolio.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg">This artist has not uploaded portfolio work yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Featured Item Display */}
              {featuredItem && (
                 <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row group">
                   <div 
                     className="w-full md:w-2/3 h-80 relative cursor-pointer overflow-hidden bg-gray-100"
                     onClick={() => setLightboxImage(featuredItem.image)}
                   >
                     <img src={featuredItem.image} alt={featuredItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                        <Star size={14} className="fill-current" /> Featured Piece
                     </div>
                     <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                         onClick={(e) => handleLikeToggle(e, featuredItem.id)}
                         className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 shadow-sm flex items-center gap-1.5 hover:bg-white transition-colors"
                       >
                         <Heart size={16} className={likesMap[featuredItem.id]?.isLiked ? "fill-red-500 text-red-500" : "text-gray-500"} />
                         {likesMap[featuredItem.id]?.count || 0}
                       </button>
                     </div>
                   </div>
                   <div className="w-full md:w-1/3 p-8 flex flex-col justify-center">
                     <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{featuredItem.title}</h3>
                     <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-md w-max mb-4">
                       {featuredItem.portrait_style}
                     </span>
                     <p className="text-gray-600 leading-relaxed">{featuredItem.description}</p>
                   </div>
                 </div>
              )}

              {standardItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {standardItems.map(item => (
                    <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer" onClick={() => setLightboxImage(item.image)}>
                      <div className="w-full h-56 bg-gray-100 overflow-hidden relative">
                         <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                           {item.portrait_style}
                         </div>
                         <button 
                           onClick={(e) => handleLikeToggle(e, item.id)}
                           className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[11px] font-bold text-gray-700 shadow-sm flex items-center gap-1 hover:bg-white transition-colors"
                         >
                           <Heart size={14} className={likesMap[item.id]?.isLiked ? "fill-red-500 text-red-500" : "text-gray-500"} />
                           {likesMap[item.id]?.count || 0}
                         </button>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

{/* Artist Reviews Section */}
<div className="mb-12">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Client Reviews
  </h2>

  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

    {/* Reviews Summary */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">

      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Star
            className="text-yellow-500 fill-current"
            size={24}
          />

          {artist?.average_rating
            ? Number(artist.average_rating).toFixed(1)
            : "No Ratings Yet"}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          Based on {artist?.total_reviews || 0}{" "}
          {artist?.total_reviews === 1
            ? "review"
            : "reviews"}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-gray-500 font-medium text-sm">
          Completed Orders
        </p>

        <p className="text-lg font-bold text-gray-900">
          {artist?.total_completed_orders || 0}
        </p>
      </div>

    </div>

    {/* Loading State */}
    {reviewsLoading ? (

      <div className="flex justify-center py-12">
        <Loader size={32} />
      </div>

    ) : reviews.length === 0 ? (

      /* Empty State */
      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">

        <Star
          size={32}
          className="text-gray-300 mx-auto mb-4"
        />

        <p className="text-gray-500 font-medium text-lg">
          No reviews yet.
        </p>

      </div>

    ) : (

      /* Reviews List */
      <div className="space-y-6">

        {reviews.map((review) => (

          <div
            key={review.id}
            className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
          >

            <div className="flex justify-between items-start mb-3">

              <div>

                <span className="font-bold text-gray-900 block mb-1">
                  {review.reviewer_name || "Client"}
                </span>

                <div className="flex gap-1">

                  {[1, 2, 3, 4, 5].map((star) => (

                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />

                  ))}

                </div>

              </div>

              <span className="text-xs text-gray-400 font-medium mt-1">
                {review.created_at
                  ? new Date(
                      review.created_at
                    ).toLocaleDateString()
                  : ""}
              </span>

            </div>

            <p className="text-gray-700 leading-relaxed text-sm italic">
              {review.review}
            </p>

          </div>

        ))}

      </div>

    )}

    {/* Pagination Buttons */}
    {(nextUrl || prevUrl) && (
      <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-100">
        {prevUrl && (
          <button
            onClick={handlePrevious}
            disabled={moreLoading}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {moreLoading ? 'Loading...' : 'show less'}
          </button>
        )}
        {nextUrl && (
          <button
            onClick={handleLoadMore}
            disabled={moreLoading}
            className="px-6 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {moreLoading ? 'Loading more...' : 'show more'}
          </button>
        )}
      </div>
    )}
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              Delivery & Pricing
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Starting Price</p>
                <p className="text-3xl font-black text-gray-900">Rs. {artist.base_price}</p>
              </div>
              <div className="w-full h-px bg-gray-100" />
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Estimated Delivery Time</p>
                <p className="text-xl font-bold text-gray-900">
                  {artist.min_delivery_days} to {artist.max_delivery_days} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
               <CheckCircle size={32} className="text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to order?</h3>
             <p className="text-gray-500 mb-8 max-w-sm">
               {user?.role === 'CLIENT' 
                 ? "Fill out the commission request form below to get started!" 
                 : "Please sign in or create a Client account to commission this artist."}
             </p>
             {!user || user?.role !== 'CLIENT' ? (
               <Link to="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                 Sign In to Request
               </Link>
             ) : (
               <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                 Scroll to Form
               </button>
             )}
          </div>
        </div>

        {user?.role === 'CLIENT' && (
          <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a Portrait</h2>
            <p className="text-gray-500 mb-8">Directly commission {artist.display_name}. Fill out the details below as accurately as possible.</p>
            
            {requestSuccess ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-green-200">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Request Sent Successfully!</h3>
                <p>Redirecting you to your requests dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-6 max-w-4xl">
                {requestError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-semibold">
                    {requestError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Project Title *</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={requestObj.title} 
                        onChange={handleRequestChange} 
                        placeholder="e.g., Anniversary Couple Portrait"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Preferred Style *</label>
                      <select 
                        name="portrait_style" 
                        value={requestObj.portrait_style} 
                        onChange={handleRequestChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all capitalize"
                      >
                        <option value="" disabled>Select style...</option>
                        {artist.portrait_styles?.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                       <label className="text-sm font-bold text-gray-700 mb-1.5 block">Budget (Rs .) (Optional)</label>
                       <input 
                         type="number" 
                         name="budget" 
                         min="0"
                         value={requestObj.budget} 
                         onChange={handleRequestChange} 
                         placeholder={`Minimum recommended: $${artist.base_price}`}
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                       />
                    </div>

                    <div>
                       <label className="text-sm font-bold text-gray-700 mb-1.5 block">Expected Delivery Date (Optional)</label>
                       <input 
                         type="date" 
                         name="expected_delivery_date" 
                         value={requestObj.expected_delivery_date} 
                         onChange={handleRequestChange} 
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                       />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex-1 flex flex-col">
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Detailed Description *</label>
                      <textarea 
                        name="description" 
                        value={requestObj.description} 
                        onChange={handleRequestChange} 
                        placeholder="Tell the artist exactly what you want..."
                        rows={5}
                        className="w-full flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Reference Image (Optional)</label>
                      <label className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors bg-gray-50">
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-600">
                          {referenceImage ? referenceImage.name : "Click to upload reference image"}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setReferenceImage(e.target.files[0])} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={requesting}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {requesting ? <><Loader size={18} /> Submitting...</> : "Submit Commission Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button 
             className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
             onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
          >
            <X size={24} />
          </button>
          <img 
            src={lightboxImage} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
