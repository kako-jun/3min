// 3min: Amazon affiliate products.
//
// アソシエイト ID は kako-jun の `ultimate-battle-22`。
// amzn.to 短縮リンクを使用 (Associates ダッシュボードで生成)。
// 画像 URL は商品ページのギャラリーにある `images/I/{imageId}._SL1500_.jpg` を使用。
// ASIN 直指定の `images/P/{ASIN}.01...` は 500px 止まりで低解像度になる。

export interface AffiliateProduct {
  /** amzn.to 短縮 URL */
  url: string
  /** 商品タイトル（短縮可） */
  title: string
  /** Amazon CDN 商品画像 URL */
  imageUrl: string
  /** kako-jun の一言コメント */
  caption: string
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    url: 'https://amzn.to/43YFzd5',
    title: 'パストリーゼ77 除菌スプレー',
    imageUrl: 'https://m.media-amazon.com/images/I/61dC04k2a2L._AC_SL1500_.jpg',
    caption: 'どんなお店にも必要なやつ！',
  },
  {
    url: 'https://amzn.to/4oj1uFj',
    title: '感熱紙 レジロール 58mm',
    imageUrl: 'https://m.media-amazon.com/images/I/81ym-dLrxZL._AC_SL1500_.jpg',
    caption: 'なんぼあってもいいですからね',
  },
  {
    url: 'https://amzn.to/4unQLLn',
    title: '高白色 コピー用紙 A4',
    imageUrl: 'https://m.media-amazon.com/images/I/61zVLFyjckL._AC_SL1280_.jpg',
    caption: 'このアプリも安いA4用紙で設計しました',
  },
]
