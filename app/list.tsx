import React, { useEffect, useState } from "react";
import {
	Text,
	View,
	TouchableOpacity,
	Image,
	StyleSheet,
	Alert,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL = "http://192.168.123.218:5000";

interface ClothingItem {
	_id: string;
	image_uri: string;
	description: string;
	tags: string[];
}

export default function ListPage() {
	const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchItems = async () => {
			try {
				const response = await axios.get(`${API_URL}/clothing`);
				setClothingItems(response.data);
			} catch (error) {
				Alert.alert("Error", "Failed to load clothing items.");
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, []);

	const deleteItem = async (id: string) => {
		try {
			await axios.delete(`${API_URL}/clothing/${id}`);
			setClothingItems((prevItems) =>
				prevItems.filter((item) => item._id !== id)
			);
			Alert.alert("Success", "Item deleted successfully!");
		} catch (error) {
			console.error("Error deleting item:", error);
			Alert.alert("Error", "Failed to delete item.");
		}
	};

	const renderItemCard = (item: ClothingItem) => (
		<View key={item._id} style={styles.card}>
			<Image source={{ uri: item.image_uri }} style={styles.cardImage} />
			<View style={styles.cardContent}>
				<Text style={styles.description}>{item.description}</Text>
				<View style={styles.tagsContainer}>
					{item.tags.map((tag, index) => (
						<Text key={index} style={styles.tag}>
							{tag}
						</Text>
					))}
				</View>
				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={[styles.button, styles.deleteButton]}
						onPress={() => deleteItem(item._id)}
					>
						<Text style={styles.buttonText}>Delete</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" color="#007bff" />
			) : (
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<Text style={styles.title}>Your Wardrobe</Text>
					{clothingItems.length === 0 ? (
						<Text style={styles.noItems}>No items found in your wardrobe.</Text>
					) : (
						<View style={styles.cardsContainer}>
							{clothingItems.map(renderItemCard)}
						</View>
					)}
				</ScrollView>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f4f4f9",
		padding: 20,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginVertical: 20,
	},
	noItems: {
		textAlign: "center",
		color: "#666",
		fontStyle: "italic",
	},
	cardsContainer: {
		flex: 1,
		marginTop: 20,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 10,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
		overflow: "hidden",
	},
	cardImage: {
		width: "100%",
		height: 400,
		resizeMode: "cover",
	},
	cardContent: {
		padding: 15,
	},
	description: {
		fontSize: 16,
		color: "#333",
		marginBottom: 15,
		textAlign: "center",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 10,
	},
	tag: {
		backgroundColor: "#d3d3d3",
		color: "#333",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 20,
		marginRight: 8,
		marginBottom: 8,
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	button: {
		backgroundColor: "#007bff",
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 30,
	},
	deleteButton: {
		backgroundColor: "#e74c3c",
	},
	buttonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
});
