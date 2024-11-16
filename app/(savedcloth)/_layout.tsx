import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Link } from "expo-router";
import { SafeAreaView, Text } from "react-native";

export default function savedCLayout() {
	return (
		<SafeAreaView>
			<Link href={"/menu"}>
				<FontAwesome name="chevron-circle-left" size={24} color="black" />
				<Text>Go back</Text>
			</Link>
		</SafeAreaView>
	);
}
