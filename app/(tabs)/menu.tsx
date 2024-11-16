import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function Menu() {
	const router = useRouter();

	const menuItems = [
		{
			title: "Upload New Item",
			icon: "add-a-photo",
			route: "/",
		},
		{
			title: "View Wardrobe",
			icon: "grid-view",
			route: "/list",
		},
		{
			title: "Get Outfit Suggestions",
			icon: "style",
			route: "/suggest",
		},
		{
			title: "Saved Outfits",
			icon: "favorite",
			route: "/savedOutfits",
		},
	];

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Wardrobe Assistant</Text>

			<View style={styles.menuGrid}>
				{menuItems.map((item, index) => (
					<TouchableOpacity
						key={index}
						style={styles.menuItem}
						onPress={() => router.push(item.route as any)}
					>
						<MaterialIcons name={item.icon as any} size={32} color="#4361ee" />
						<Text style={styles.menuText}>{item.title}</Text>
					</TouchableOpacity>
				))}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#212529",
		textAlign: "center",
		marginVertical: 24,
	},
	menuGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 16,
		marginTop: 20,
	},
	menuItem: {
		backgroundColor: "#ffffff",
		padding: 20,
		borderRadius: 16,
		width: "45%",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		aspectRatio: 1,
	},
	menuText: {
		marginTop: 12,
		fontSize: 16,
		color: "#495057",
		textAlign: "center",
		fontWeight: "500",
	},
});
