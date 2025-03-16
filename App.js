import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Image, StyleSheet, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [image, setImage] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const storedBooks = await AsyncStorage.getItem("books");
    if (storedBooks) setBooks(JSON.parse(storedBooks));
  };

  const saveBooks = async (books) => {
    await AsyncStorage.setItem("books", JSON.stringify(books));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addBook = () => {
    if (!title || !author || !genre || !image) {
      Alert.alert("Error", "Please enter title, author, genre, and select an image.");
      return;
    }
    if (editingBook) {
      const updatedBooks = books.map((book) => 
        book.id === editingBook.id ? { ...book, title, author, genre, image } : book
      );
      setBooks(updatedBooks);
      saveBooks(updatedBooks);
      setEditingBook(null);
    } else {
      const newBook = { id: Date.now().toString(), title, author, genre, image, status: "Unread" };
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      saveBooks(updatedBooks);
    }
    setTitle("");
    setAuthor("");
    setGenre("");
    setImage(null);
  };

  const deleteBook = (id) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const toggleStatus = (id) => {
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, status: book.status === "Read" ? "Unread" : "Read" } : book
    );
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setImage(book.image);
    setEditingBook(book);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Book Library 📚</Text>
      <TextInput
        placeholder="Book Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
        style={styles.input}
      />
      <TextInput
        placeholder="Genre"
        value={genre}
        onChangeText={setGenre}
        style={styles.input}
      />
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Pick an Image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.largeImage} />}
      <TouchableOpacity style={styles.addButton} onPress={addBook}>
        <Text style={styles.addButtonText}>{editingBook ? "Update Book" : "Add Book"}</Text>
      </TouchableOpacity>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            <Image source={{ uri: item.image }} style={styles.largeBookImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title} - {item.author}</Text>
              <Text style={styles.bookGenre}>Genre: {item.genre}</Text>
              <Text style={styles.bookStatus}>Status: {item.status}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleStatus(item.id)}>
                  <Text style={styles.toggleText}>{item.status === "Read" ? "Mark Unread" : "Mark Read"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => editBook(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteBook(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  bookGenre: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
  imageButton: {
    backgroundColor: "#28a745",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  largeImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bookItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 5,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  largeBookImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookStatus: {
    fontSize: 14,
    color: "gray",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    flex: 1,
  },


  
});