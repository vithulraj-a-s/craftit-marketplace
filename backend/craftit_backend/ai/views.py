from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from ai.services.search_service import SemanticSearchService

from profiles.models import ArtistProfile
from profiles.serializers import ArtistProfileDetailSerializer


class SemanticArtistSearchView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        query = request.data.get("query", "").strip()

        if not query:

            return Response({
                "results": []
            })

        artists = SemanticSearchService.search(query)

        serialized = ArtistProfileDetailSerializer(
            artists,
            many=True,
            context={"request": request}
        )

        return Response({
            "results": serialized.data
        })