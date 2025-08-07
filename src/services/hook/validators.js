export const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  const pattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

  return pattern.test(url);
};

export default isValidImageUrl;