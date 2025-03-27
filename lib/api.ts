export const fetchUserDetails = async () => {
    try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        const response = await fetch("http://localhost:3001/user/details", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch user details");

        return await response.json();
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
};
