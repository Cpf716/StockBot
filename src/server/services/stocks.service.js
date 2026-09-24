class StocksService {
  // Member Fields

  params = {
    token: process.env.FINNHUB_TOKEN,
  };

  /**
   * Returns the current stock quote
   * @param {string} symbol - The stock symbol
   * @returns The quote object
   */
  async getQuote(symbol) {
    const params = new URLSearchParams({
      ...this.params,
      symbol,
    });

    const response = await fetch(`${process.env.FINNHUB_URL}/quote?${params}`);

    return response.json();
  }
}

module.exports = { StocksService };
