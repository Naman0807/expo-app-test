import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs screenOptions={{ tabBarActiveTintColor: "blue", headerShown: false }}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Upload",
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons
							name="progress-upload"
							size={28}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="suggest"
				options={{
					title: "",
					tabBarIcon: ({ color }) => (
						<FontAwesome6 size={28} name="wand-magic-sparkles" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="list"
				options={{
					title: "",
					tabBarIcon: ({ color }) => (
						<FontAwesome size={28} name="bars" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="menu"
				options={{
					title: "",
					tabBarIcon: ({ color }) => (
						<FontAwesome size={28} name="user-o" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
