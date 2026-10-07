import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { radii, shadows } from '@/constants/theme';
import { Book } from '@/types/book';

export function BookCover({ book, width = 112, elevated = true }: { book: Book; width?: number; elevated?: boolean }) {
  const height = Math.round(width * 1.46);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [book.coverUrl]);

  return (
    <View style={[styles.cover, elevated && shadows.card, { width, height, borderRadius: width > 100 ? radii.md : radii.sm }]}>
      {book.coverUrl && !imageFailed ? <Image source={{ uri: book.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`Bìa sách ${book.title}`} onError={() => setImageFailed(true)} /> : (
        <><Text numberOfLines={3} style={[styles.title, { fontSize: Math.max(10, width * 0.105) }]}>{book.title}</Text><Text style={[styles.author, { fontSize: Math.max(8, width * 0.075) }]}>{book.author}</Text></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden', padding: 12, justifyContent: 'flex-end', backgroundColor: '#31594A' },
  title: { color: '#FFFDF8', fontWeight: '800', letterSpacing: 0.6, lineHeight: 16 },
  author: { color: '#FFFDF8', opacity: 0.74, marginTop: 5, letterSpacing: 0.4 },
});
