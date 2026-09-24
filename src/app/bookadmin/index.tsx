import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://127.0.0.1:8000/api";

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

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/books`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      setBooks(json.data);
    } catch (error) {
      Alert.alert("Error", "Cannot load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

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
        window.alert('Title is required');
        return;
    }

    if (!categoryId || !authorId) {
        window.alert(
            'Category ID and Author ID are required'
        );
        return;
    }

    const body = {
        category_id: Number(categoryId),
        author_id: Number(authorId),
        title: title.trim(),
        description: description.trim() || null,
        cover: cover.trim() || null,
        language: 'vi',
        status,
    };

    console.log('SENDING BOOK DATA:', body);

    try {
        const url = editingBook
            ? `${API_URL}/books/${editingBook.id}`
            : `${API_URL}/books`;

        const response = await fetch(url, {
            method: editingBook ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
        });

        const json = await response.json();

        console.log('API RESPONSE:', json);

        if (!response.ok) {
            const errors = json.errors;

            if (errors) {
                const errorMessages = Object.values(errors)
                    .flat()
                    .join('\n');

                window.alert(errorMessages);
            } else {
                window.alert(
                    json.message || 'Cannot save book'
                );
            }

            return;
        }

        setModalVisible(false);

        await fetchBooks();

        window.alert(
            editingBook
                ? 'Book updated successfully!'
                : 'Book created successfully!'
        );

    } catch (error) {
        console.error('SAVE BOOK ERROR:', error);

        window.alert('Cannot connect to Laravel API');
    }
};

  const deleteBook = async (book: Book) => {

    console.log('Delete button pressed:', book.id);

    const performDelete = async () => {
        try {

            const url = `${API_URL}/books/${book.id}`;

            console.log('DELETE URL:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
            });

            const result = await response.json();

            console.log('DELETE RESPONSE:', result);

            if (!response.ok) {
                throw new Error(
                    result.message || 'Delete failed'
                );
            }

            // Cập nhật danh sách sau khi xóa thành công
            setBooks((prevBooks) =>
                prevBooks.filter(
                    (item) => item.id !== book.id
                )
            );

            if (Platform.OS === 'web') {
                window.alert('Book deleted successfully!');
            } else {
                Alert.alert(
                    'Success',
                    'Book deleted successfully!'
                );
            }

        } catch (error) {

            console.error('DELETE ERROR:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Cannot delete book';

            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('Error', message);
            }
        }
    };

    // React Native Web
    if (Platform.OS === 'web') {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${book.title}"?`
        );

        if (confirmed) {
            await performDelete();
        }

        return;
    }

    // React Native Android / iOS
    Alert.alert(
        'Delete book',
        `Are you sure you want to delete "${book.title}"?`,
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    void performDelete();
                },
            },
        ]
    );
};

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
});
