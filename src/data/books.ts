import { Book } from '@/types/book';

const chapterText = [
  'Có những buổi sáng, thành phố thức dậy rất chậm. Ánh nắng nằm lại trên bậu cửa, còn tiếng lá ngoài hiên khẽ chạm vào nhau như một lời nhắc dịu dàng.',
  'An đặt cuốn sách xuống bàn và nhìn ra khoảng trời nhỏ trước mặt. Cô đã đi qua nhiều nơi, gặp nhiều người, nhưng vẫn tin rằng mọi hành trình đáng nhớ đều bắt đầu từ một câu hỏi rất đơn giản.',
  'Ta đang tìm điều gì? Có lẽ không phải một nơi chốn, mà là cảm giác được sống trọn vẹn trong từng khoảnh khắc. Khi hiểu điều đó, những con đường xa bỗng trở nên gần hơn.',
  'Cô mở trang tiếp theo. Mùi giấy mới hòa vào hương trà, yên tĩnh và ấm áp. Bên ngoài, ngày đã sáng rõ, đủ để bắt đầu một câu chuyện khác.',
];

const makeChapters = (prefix: string) => [
  { id: `${prefix}-1`, number: 1, title: 'Khởi đầu từ một trang giấy', duration: '12 phút', content: chapterText },
  { id: `${prefix}-2`, number: 2, title: 'Thành phố của những ký ức', duration: '16 phút', content: [...chapterText].reverse() },
  { id: `${prefix}-3`, number: 3, title: 'Một khoảng trời rất xanh', duration: '14 phút', content: chapterText },
  { id: `${prefix}-4`, number: 4, title: 'Điều ta mang theo', duration: '18 phút', content: [...chapterText, chapterText[1]] },
  { id: `${prefix}-5`, number: 5, title: 'Ngày trở về', duration: '11 phút', content: chapterText },
];

export const books: Book[] = [
  { id: 'nhung-ngay-rat-cham', title: 'Những ngày rất chậm', author: 'Minh An', category: 'Văn học', description: 'Một tập tản văn về cách ta tìm lại nhịp sống của mình giữa thành phố luôn vội vã.', coverColor: '#31594A', accentColor: '#D7B46A', coverMark: 'N', rating: 4.8, readers: '12,4K', readTime: '2 giờ 34 phút', chapters: makeChapters('slow') },
  { id: 'khu-vuon-ben-o-cua', title: 'Khu vườn bên ô cửa', author: 'Hà Phương', category: 'Chữa lành', description: 'Những mẩu chuyện ấm áp về thiên nhiên, gia đình và niềm vui trong điều bình dị.', coverColor: '#D77752', accentColor: '#F7DEB1', coverMark: 'K', rating: 4.7, readers: '8,9K', readTime: '3 giờ 10 phút', chapters: makeChapters('garden') },
  { id: 'nghe-thuat-tap-trung', title: 'Nghệ thuật tập trung', author: 'Đức Nam', category: 'Phát triển', description: 'Một phương pháp thực tế để bảo vệ sự chú ý và tạo ra những giờ làm việc có chiều sâu.', coverColor: '#22334A', accentColor: '#E6C96E', coverMark: 'T', rating: 4.9, readers: '21,2K', readTime: '4 giờ 02 phút', chapters: makeChapters('focus') },
  { id: 'van-dam-co-don', title: 'Vạn dặm cô đơn', author: 'Lâm Chi', category: 'Tiểu thuyết', description: 'Chuyến tàu xuyên qua miền ký ức đưa hai người xa lạ đến gần nhau hơn.', coverColor: '#7A4B62', accentColor: '#E8C6A7', coverMark: 'V', rating: 4.6, readers: '6,7K', readTime: '5 giờ 18 phút', chapters: makeChapters('miles') },
  { id: 'mot-doi-song-xanh', title: 'Một đời sống xanh', author: 'Thanh Vũ', category: 'Kỹ năng', description: 'Những thay đổi nhỏ và bền vững để sống nhẹ hơn với bản thân và hành tinh.', coverColor: '#768C69', accentColor: '#F4E3A1', coverMark: 'X', rating: 4.5, readers: '5,3K', readTime: '2 giờ 48 phút', chapters: makeChapters('green') },
];

export const categories = ['Tất cả', 'Văn học', 'Chữa lành', 'Phát triển', 'Tiểu thuyết', 'Kỹ năng'];

export function getBook(id?: string) {
  return books.find((book) => book.id === id) ?? books[0];
}

export function getChapter(id?: string) {
  for (const book of books) {
    const chapter = book.chapters.find((item) => item.id === id);
    if (chapter) return { book, chapter };
  }
  return { book: books[0], chapter: books[0].chapters[0] };
}
