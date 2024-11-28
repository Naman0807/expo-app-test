import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL = "http://192.168.255.218:5000";

interface ClothingItem {
	_id: string;
	image_uri: string;
	description: string;
	tags: string[];
}

export default function Suggest() {
	const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
	const [outfitSuggestion, setOutfitSuggestion] = useState<ClothingItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<{
		topwear: ClothingItem | null;
		bottomwear: ClothingItem | null;
		footwear: ClothingItem | null;
	}>({
		topwear: null,
		bottomwear: null,
		footwear: null,
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchWardrobe();
	}, []);

	const fetchWardrobe = async () => {
		try {
			const response = await axios.get(`${API_URL}/clothing`);
			setWardrobe(response.data);
		} catch (error) {
			console.error("Error fetching wardrobe:", error);
			Alert.alert("Error", "Failed to fetch wardrobe items");
		}
	};

	const generateOutfit = async () => {
		setLoading(true);
		try {
			const response = await axios.post(`${API_URL}/suggest`, {
				selected_items: selectedItems,
			});
			setOutfitSuggestion(response.data);
		} catch (error) {
			console.error("Error generating outfit:", error);
			Alert.alert(
				"Error",
				"Failed to generate outfit suggestion. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const getItemCategory = (item: ClothingItem): string => {
		const tags = item.tags.map((tag) => tag.toLowerCase());
		if (
			tags.some((tag) =>
				["topwear", "shirt", "t-shirt", "blouse", "sweater"].includes(tag)
			)
		) {
			return "topwear";
		}
		if (
			tags.some((tag) =>
				["bottomwear", "pants", "jeans", "skirt", "shorts"].includes(tag)
			)
		) {
			return "bottomwear";
		}
		if (
			tags.some((tag) =>
				["footwear", "shoes", "boots", "sandals", "sneakers"].includes(tag)
			)
		) {
			return "footwear";
		}
		return "";
	};

	const handleSelection = (item: ClothingItem) => {
		const category = getItemCategory(item);
		if (category) {
			setSelectedItems((prev) => ({
				...prev,
				[category]:
					prev[category as keyof typeof prev]?._id === item._id ? null : item,
			}));
			setOutfitSuggestion([]); // Clear previous suggestions
		}
	};

	const renderWardrobeSection = (title: string, items: ClothingItem[]) => (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={styles.itemContainer}>
					{items.map((item) => {
						const category = getItemCategory(item);
						const isSelected =
							selectedItems[category as keyof typeof selectedItems]?._id ===
							item._id;

						return (
							<TouchableOpacity
								key={item._id}
								onPress={() => handleSelection(item)}
								style={[styles.item, isSelected && styles.selectedItem]}
							>
								<Image
									source={{ uri: item.image_uri }}
									style={styles.itemImage}
								/>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);

	const renderSuggestion = () => (
		<View style={styles.suggestionContainer}>
			<Text style={styles.sectionTitle}>Suggested Outfit</Text>
			<View style={styles.outfitContainer}>
				{outfitSuggestion.map((item) => (
					<View key={item._id} style={styles.suggestionItem}>
						<Image
							source={{ uri: item.image_uri }}
							style={styles.suggestionImage}
						/>
					</View>
				))}
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				{renderWardrobeSection(
					"Tops",
					wardrobe.filter((item) =>
						item.tags.some((tag) =>
							["topwear", "shirt", "t-shirt", "blouse", "sweater"].includes(
								tag.toLowerCase()
							)
						)
					)
				)}
				{renderWardrobeSection(
					"Bottoms",
					wardrobe.filter((item) =>
						item.tags.some((tag) =>
							["bottomwear", "pants", "jeans", "skirt", "shorts"].includes(
								tag.toLowerCase()
							)
						)
					)
				)}
				{renderWardrobeSection(
					"Footwear",
					wardrobe.filter((item) =>
						item.tags.some((tag) =>
							["footwear", "shoes", "boots", "sandals", "sneakers"].includes(
								tag.toLowerCase()
							)
						)
					)
				)}

				<TouchableOpacity
					style={styles.generateButton}
					onPress={generateOutfit}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.generateButtonText}>
							Generate Outfit Suggestion
						</Text>
					)}
				</TouchableOpacity>

				{outfitSuggestion.length > 0 && renderSuggestion()}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	section: {
		marginVertical: 10,
		paddingHorizontal: 15,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	itemContainer: {
		flexDirection: "row",
		gap: 10,
	},
	item: {
		width: 120,
		marginRight: 10,
		borderRadius: 8,
		backgroundColor: "#f0f0f0",
		padding: 5,
	},
	selectedItem: {
		borderWidth: 2,
		borderColor: "#4361ee",
	},
	itemImage: {
		width: "100%",
		height: 120,
		borderRadius: 8,
		marginBottom: 5,
	},
	itemDescription: {
		fontSize: 12,
		textAlign: "center",
	},
	generateButton: {
		backgroundColor: "#4361ee",
		padding: 15,
		borderRadius: 8,
		margin: 15,
		alignItems: "center",
	},
	generateButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	suggestionContainer: {
		margin: 15,
	},
	outfitContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		gap: 10,
	},
	suggestionItem: {
		width: "45%",
		aspectRatio: 1,
		marginBottom: 10,
	},
	suggestionImage: {
		width: "100%",
		height: "80%",
		borderRadius: 8,
		marginBottom: 5,
	},
});
