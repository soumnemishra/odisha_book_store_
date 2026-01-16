import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function Index() {
    const { user, token, isCheckingAuth } = useAuthStore();

    if (isCheckingAuth) {
        return null; // Show nothing while checking auth
    }

    // Redirect to appropriate screen based on auth state
    if (user && token) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)" />;
}
