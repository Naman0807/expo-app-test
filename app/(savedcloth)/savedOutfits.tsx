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
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = "http://192.168.255.218:5000";

interface ClothingItem {
	_id: string;
	image_uri: string;
	description: string;
}

interface SavedOutfit {
	_id: string;
	items: ClothingItem[];
	date: string;
}

export default function SavedOutfits() {
	const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchSavedOutfits();
	}, []);

	const fetchSavedOutfits = async () => {
		try {
			const response = await axios.get(`${API_URL}/saved_outfits`);
			setSavedOutfits(response.data);
		} catch (error) {
			console.error("Error fetching saved outfits:", error);
			Alert.alert("Error", "Failed to load saved outfits");
		} finally {
			setLoading(false);
		}
	};

	const deleteOutfit = async (outfitId: string) => {
		try {
			await axios.delete(`${API_URL}/saved_outfits/${outfitId}`);
			setSavedOutfits((prevOutfits) =>
				prevOutfits.filter((outfit) => outfit._id !== outfitId)
			);
			Alert.alert("Success", "Outfit deleted successfully");
		} catch (error) {
			console.error("Error deleting outfit:", error);
			Alert.alert("Error", "Failed to delete outfit");
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<ActivityIndicator size="large" color="#4361ee" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Saved Outfits</Text>

				{savedOutfits.length === 0 ? (
					<Text style={styles.emptyText}>
						No saved outfits yet. Generate and save some outfits!
					</Text>
				) : (
					savedOutfits.map((outfit) => (
						<View key={outfit._id} style={styles.outfitCard}>
							<Text style={styles.dateText}>
								{new Date(outfit.date).toLocaleDateString()}
							</Text>
							<View style={styles.itemsContainer}>
								{outfit.items.map((item) => (
									<View key={item._id} style={styles.itemCard}>
										<Image
											source={{ uri: item.image_uri }}
											style={styles.itemImage}
										/>
										<Text style={styles.itemDescription}>
											{item.description}
										</Text>
									</View>
								))}
							</View>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => deleteOutfit(outfit._id)}
							>
								<MaterialIcons name="delete" size={24} color="#fff" />
							</TouchableOpacity>
						</View>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	scrollContent: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#212529",
		textAlign: "center",
		marginVertical: 20,
	},
	outfitCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	dateText: {
		fontSize: 16,
		color: "#495057",
		marginBottom: 12,
	},
	itemsContainer: {
		gap: 16,
	},
	itemCard: {
		backgroundColor: "#ffffff",
		borderRadius: 8,
		padding: 8,
	},
	itemImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
		marginBottom: 8,
	},
	itemDescription: {
		fontSize: 14,
		color: "#495057",
		textAlign: "center",
	},
	deleteButton: {
		backgroundColor: "#dc3545",
		padding: 12,
		borderRadius: 8,
		alignSelf: "center",
		marginTop: 16,
	},
	emptyText: {
		textAlign: "center",
		color: "#6c757d",
		fontSize: 16,
		marginTop: 40,
		fontStyle: "italic",
	},
});
