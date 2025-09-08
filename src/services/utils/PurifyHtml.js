import DOMPurify from 'dompurify';

const PurifyHtml = (html) => {

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_ATTR: ['style'], // optionnel, si tu veux interdire style inline
    FORBID_TAGS: ['script', 'iframe'], // supprime scripts et iframes
  });

}

export default PurifyHtml;