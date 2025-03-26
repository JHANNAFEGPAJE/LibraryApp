import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Modal, Button, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';

const LibraryApp = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', price: '', image: '' });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const storedBooks = await AsyncStorage.getItem('books');
    if (storedBooks) setBooks(JSON.parse(storedBooks));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You need to allow access to your gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 6],
      quality: 1,
    });

    if (!result.canceled) {
      setNewBook({ ...newBook, image: result.assets[0].uri });
    }
  };

  const addOrEditBook = async () => {
    if (!newBook.title || !newBook.price || !newBook.image) return;

    let updatedBooks;
    if (editingBook) {
      updatedBooks = books.map((book) =>
        book.id === editingBook.id ? { ...editingBook, ...newBook } : book
      );
    } else {
      const book = { id: uuid.v4(), ...newBook };
      updatedBooks = [...books, book];
    }

    setBooks(updatedBooks);
    await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
    setNewBook({ title: '', price: '', image: '' });
    setEditingBook(null);
    setModalVisible(false);
  };

  const editBook = (book) => {
    setNewBook({ title: book.title, price: book.price, image: book.image });
    setEditingBook(book);
    setModalVisible(true);
  };

  const deleteBook = async (id) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);
    await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="grid" size={24} color="black" />
        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profileImage} />
      </View>
      <Text style={styles.title}>Discover your best books now</Text>
      <Text style={styles.subtitle}>Find your dream book according to your preferences and join our family. What are you waiting for?</Text>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchBox} 
          placeholder="Search for a book" 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
      <Text style={styles.sectionTitle}>Popular Now</Text>
      <FlatList 
        data={books.filter(book => book.title.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <Image source={{ uri: item.image }} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookPrice}>${item.price}</Text>
            <View style={styles.cardButtons}>
              <TouchableOpacity onPress={() => editBook(item)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteBook(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Book</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBook ? 'Edit Book' : 'Add Book'}</Text>
            <TextInput placeholder="Title" style={styles.input} value={newBook.title} onChangeText={(text) => setNewBook({ ...newBook, title: text })} />
            <TextInput placeholder="Price" style={styles.input} value={newBook.price} onChangeText={(text) => setNewBook({ ...newBook, price: text })} keyboardType="numeric" />
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            </TouchableOpacity>
            {newBook.image ? <Image source={{ uri: newBook.image }} style={styles.previewImage} /> : null}
            <View style={styles.modalButtons}>
              <Button title={editingBook ? 'Update' : 'Add'} onPress={addOrEditBook} />
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: 'gray', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  searchBox: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  bookCard: { flex: 1, margin: 5, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 10, alignItems: 'center' },
  bookImage: { width: 100, height: 150, borderRadius: 10 },
  bookTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  bookPrice: { fontSize: 14, color: 'gray' },
  cardButtons: { flexDirection: 'row', marginTop: 5 },
  editButton: { color: 'blue', marginRight: 10 },
  deleteButton: { color: 'red' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  imagePicker: { backgroundColor: '#000', padding: 10, borderRadius: 5, marginBottom: 10 },
  imagePickerText: { color: '#fff', textAlign: 'center' },
  previewImage: { width: 100, height: 150, borderRadius: 10, marginTop: 10 },
  addButton: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default LibraryApp;
