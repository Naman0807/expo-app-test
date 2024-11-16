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
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

	const filteredItems = selectedTag
		? clothingItems.filter((item) => item.tags.includes(selectedTag))
		: clothingItems;

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

	const renderTagFilterButtons = () => {
		const uniqueTags = Array.from(
			new Set(clothingItems.flatMap((item) => item.tags))
		);

		return (
			<View style={styles.filterContainer}>
				<TouchableOpacity
					style={[
						styles.filterButton,
						!selectedTag && styles.activeFilterButton,
					]}
					onPress={() => setSelectedTag(null)}
				>
					<Text
						style={[styles.filterText, !selectedTag && styles.activeFilterText]}
					>
						All
					</Text>
				</TouchableOpacity>
				{uniqueTags.map((tag) => (
					<TouchableOpacity
						key={tag}
						style={[
							styles.filterButton,
							selectedTag === tag && styles.activeFilterButton,
						]}
						onPress={() => setSelectedTag(tag)}
					>
						<Text
							style={[
								styles.filterText,
								selectedTag === tag && styles.activeFilterText,
							]}
						>
							{tag}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" color="#4A90E2" />
			) : (
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<Text style={styles.title}>Your Wardrobe</Text>
					{renderTagFilterButtons()}
					{filteredItems.length === 0 ? (
						<Text style={styles.noItems}>No items found for this filter.</Text>
					) : (
						<View style={styles.cardsContainer}>
							{filteredItems.map(renderItemCard)}
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
		backgroundColor: "#f8f9fa",
		padding: 20,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#212529",
		textAlign: "center",
		marginVertical: 24,
	},
	filterContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginBottom: 15,
	},
	filterButton: {
		backgroundColor: "#ffffff",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 12,
		margin: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	activeFilterButton: {
		backgroundColor: "#4361ee",
	},
	filterText: {
		color: "#495057",
		fontWeight: "500",
	},
	activeFilterText: {
		color: "#ffffff",
	},
	noItems: {
		textAlign: "center",
		color: "#6c757d",
		fontStyle: "italic",
		fontSize: 16,
		marginTop: 20,
	},
	cardsContainer: {
		flex: 1,
		width: "100%",
		marginTop: 20,
	},
	card: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		overflow: "hidden",
	},
	cardImage: {
		width: "100%",
		height: 250,
		resizeMode: "cover",
	},
	cardContent: {
		padding: 20,
	},
	description: {
		fontSize: 16,
		color: "#495057",
		marginBottom: 10,
		textAlign: "center",
		fontWeight: "500",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginBottom: 15,
	},
	tag: {
		backgroundColor: "#e9ecef",
		color: "#495057",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		marginRight: 8,
		marginBottom: 8,
		fontSize: 14,
		fontWeight: "500",
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	button: {
		backgroundColor: "#4361ee",
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 12,
		marginTop: 10,
		shadowColor: "#4361ee",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 2,
	},
	deleteButton: {
		backgroundColor: "#D9534F",
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "500",
	},
});
