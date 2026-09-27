import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from '@/services/api';

const notify = (message: string) => Platform.OS === 'web' ? window.alert(message) : Alert.alert('Mộc Thư', message);

type Book = {
  id: number;
  category_id: number;
  author_id: number;
  title: string;
  description: string | null;
  cover: string | null;
  language: string;
  status: string;
  view_count: number;
};

export default function BookManagementScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [status, setStatus] = useState("ongoing");

  const [error, setError] = useState(false);

  const fetchBooks = useCallback(async () => {
    const MIN_LOADING_TIME = 2000; // 2 seconds

    const startTime = Date.now();

    try {
      setLoading(true);
      setError(false);

      const json = await apiRequest<{ data: Book[] }>('/books');

      setBooks(json.data);
    } catch (error) {
      console.error("FETCH BOOKS ERROR:", error);

      setError(true);
    } finally {
      // Calculate how long the API request took
      const elapsedTime = Date.now() - startTime;

      // Calculate remaining loading time
      const remainingTime = Math.max(MIN_LOADING_TIME - elapsedTime, 0);

      // Wait for the remaining time
      if (remainingTime > 0) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, remainingTime),
        );
      }

      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks]),
  );

  const openCreateModal = () => {
    setEditingBook(null);

    setTitle("");
    setDescription("");
    setCover("");
    setCategoryId("");
    setAuthorId("");
    setStatus("ongoing");

    setModalVisible(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);

    setTitle(book.title);
    setDescription(book.description ?? "");
    setCover(book.cover ?? "");
    setCategoryId(String(book.category_id));
    setAuthorId(String(book.author_id));
    setStatus(book.status);

    setModalVisible(true);
  };

  const saveBook = async () => {
    if (!title.trim()) {
      notify("Title is required");
      return;
    }

    if (!categoryId || !authorId) {
      notify("Category ID and Author ID are required");
      return;
    }

    const body = {
      category_id: Number(categoryId),
      author_id: Number(authorId),
      title: title.trim(),
      description: description.trim() || null,
      cover: cover.trim() || null,
      language: "vi",
      status,
    };

    try {
      await apiRequest(editingBook ? `/books/${editingBook.id}` : '/books', {
        method: editingBook ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setModalVisible(false);

      await fetchBooks();

      notify(
        editingBook
          ? "Book updated successfully!"
          : "Book created successfully!",
      );
    } catch (error) {
      console.error("SAVE BOOK ERROR:", error);

      notify(error instanceof Error ? error.message : "Cannot connect to Laravel API");
    }
  };

  const deleteBook = async (book: Book) => {
    console.log("Delete button pressed:", book.id);

    const performDelete = async () => {
      try {
        await apiRequest(`/books/${book.id}`, { method: 'DELETE' });

        // Cập nhật danh sách sau khi xóa thành công
        setBooks((prevBooks) =>
          prevBooks.filter((item) => item.id !== book.id),
        );

        if (Platform.OS === "web") {
          window.alert("Book deleted successfully!");
        } else {
          Alert.alert("Success", "Book deleted successfully!");
        }
      } catch (error) {
        console.error("DELETE ERROR:", error);

        const message =
          error instanceof Error ? error.message : "Cannot delete book";

        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Error", message);
        }
      }
    };

    // React Native Web
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${book.title}"?`,
      );

      if (confirmed) {
        await performDelete();
      }

      return;
    }

    // React Native Android / iOS
    Alert.alert(
      "Delete book",
      `Are you sure you want to delete "${book.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void performDelete();
          },
        },
      ],
    );
  };

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  const renderBook = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>

        <Text style={styles.bookMeta}>ID: {item.id}</Text>

        <Text style={styles.bookMeta}>Category: {item.category_id}</Text>

        <Text style={styles.bookMeta}>Status: {item.status}</Text>

        <Text style={styles.bookMeta}>Views: {item.view_count}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteBook(item)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <View style={styles.stateContent}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>!</Text>
          </View>

          <Text style={styles.stateTitle}>Something Went Wrong</Text>

          <Text style={styles.stateDescription}>
            We couldn&apos;t load your books. Please check your internet connection
            and try again.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchBooks}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.retryButtonText}>↻ Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <View style={styles.stateContent}>
          <View style={styles.loadingIconContainer}>
            <Text style={styles.loadingIcon}>📚</Text>
          </View>

          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={styles.loadingSpinner}
          />

          <Text style={styles.stateTitle}>Loading Books</Text>

          <Text style={styles.stateDescription}>
            Please wait while we fetch your books...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Management</Text>

        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.buttonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBook}
        refreshing={loading}
        onRefresh={fetchBooks}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No books found.</Text>}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingBook ? "Edit Book" : "Add Book"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Cover URL"
              value={cover}
              onChangeText={setCover}
            />

            <TextInput
              style={styles.input}
              placeholder="Category ID"
              value={categoryId}
              onChangeText={setCategoryId}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Author ID"
              value={authorId}
              onChangeText={setAuthorId}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Status"
              value={status}
              onChangeText={setStatus}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveBook}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  list: {
    padding: 16,
  },

  bookCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bookInfo: {
    flex: 1,
  },

  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  bookMeta: {
    color: "#666",
    marginTop: 2,
  },

  actions: {
    justifyContent: "center",
    gap: 8,
    marginLeft: 10,
  },

  editButton: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 6,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  cancelButton: {
    padding: 12,
  },

  saveButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  // ================================
  // LOADING & ERROR STATES
  // ================================

  stateContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  stateContent: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  // ================================
  // LOADING
  // ================================

  loadingIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  loadingIcon: {
    fontSize: 42,
  },

  loadingSpinner: {
    marginBottom: 24,
  },

  // ================================
  // ERROR
  // ================================

  errorIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  errorIcon: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#dc2626",
  },

  // ================================
  // SHARED TEXT
  // ================================

  stateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },

  stateDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  // ================================
  // RETRY BUTTON
  // ================================

  retryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
