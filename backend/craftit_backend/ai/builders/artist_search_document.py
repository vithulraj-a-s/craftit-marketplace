class ArtistSearchDocumentBuilder:

    @staticmethod
    def build(artist):

        normalized_styles = [
            style.strip().lower()
            for style in artist.portrait_styles
        ]

        portfolio_items = artist.portfolio_items.all().order_by("-created_at")[:20]

        portfolio_text = " ".join([
            f"""
            Title: {item.title}

            Description:
            {item.description}
            """
            for item in portfolio_items
        ])

        search_text = f"""
        Artist Name:
        {artist.display_name}

        Bio:
        {artist.short_bio}

        Location:
        {artist.location}

        Portrait Styles:
        {' '.join(normalized_styles)}

        Experience:
        {artist.years_of_experience} years

        Portfolio Content:
        {portfolio_text}
        """

        return " ".join(search_text.split())