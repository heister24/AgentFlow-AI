import { useEffect } from "react";

/**
 * Custom hook to dynamically manage page-specific meta title and description for SEO
 */
export const usePageMeta = ({ title, description, keywords, image } = {}) => {
  useEffect(() => {
    if (title) {
      document.title = title;

      // Meta Title
      const titleTag = document.querySelector('meta[name="title"]');
      if (titleTag) titleTag.setAttribute("content", title);

      // Open Graph Title
      const ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (ogTitleTag) ogTitleTag.setAttribute("content", title);

      // Twitter Title
      const twitterTitleTag = document.querySelector(
        'meta[name="twitter:title"]',
      );
      if (twitterTitleTag) twitterTitleTag.setAttribute("content", title);
    }

    if (description) {
      // Standard Meta Description
      let descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        descTag.setAttribute("content", description);
      } else {
        descTag = document.createElement("meta");
        descTag.name = "description";
        descTag.content = description;
        document.head.appendChild(descTag);
      }

      // Open Graph Description
      const ogDescTag = document.querySelector(
        'meta[property="og:description"]',
      );
      if (ogDescTag) ogDescTag.setAttribute("content", description);

      // Twitter Description
      const twitterDescTag = document.querySelector(
        'meta[name="twitter:description"]',
      );
      if (twitterDescTag) twitterDescTag.setAttribute("content", description);
    }

    if (keywords) {
      const keywordsTag = document.querySelector('meta[name="keywords"]');
      if (keywordsTag) keywordsTag.setAttribute("content", keywords);
    }

    if (image) {
      const ogImgTag = document.querySelector('meta[property="og:image"]');
      if (ogImgTag) ogImgTag.setAttribute("content", image);

      const twImgTag = document.querySelector('meta[name="twitter:image"]');
      if (twImgTag) twImgTag.setAttribute("content", image);
    }
  }, [title, description, keywords, image]);
};

export default usePageMeta;
