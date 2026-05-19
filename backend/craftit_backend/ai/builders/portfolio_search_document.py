class PortfolioSearchDocumentBuilder:

    @staticmethod
    def build(portfolio_item):

        search_text = f"""
        Portfolio Title:
        {portfolio_item.title}

        Description:
        {portfolio_item.description}

        Portrait Style:
        {portfolio_item.portrait_style}

        Artist Name:
        {portfolio_item.artist_profile.display_name}

        Artist Bio:
        {portfolio_item.artist_profile.short_bio}

        Artist Styles:
        {' '.join(portfolio_item.artist_profile.portrait_styles)}
        """

        return " ".join(search_text.split())