// utils/auth.ts
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return exp > currentTime;
  } catch (err) {
    return false;
  }
};
