// Utility functions for the Art Tools app

export const formatPrice = (price) => {
  return `$${price}`;
};

export const formatDiscount = (discount) => {
  return `${Math.round(discount * 100)}% OFF`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) return 0;
  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return sum / feedbacks.length;
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

