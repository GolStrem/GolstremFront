import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';

const LnPasswordField = ({
  name,
  label,
  value,
  onChange,
  error,
  strength,
  showStrength = false,
  score = 0,
  getStrengthColor,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <div className="ln-password-field">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={64}
          aria-invalid={!!error}
          required
        />
        <button
          type="button"
          className="ln-eye-toggle"
          onClick={() => setVisible(!visible)}
          aria-label="Afficher / masquer le mot de passe"
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="ln-help">
        Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.
      </div>

      <div className="ln-password-info">
        <span className={`ln-error ${error ? 'ln-visible' : 'ln-hidden'}`}>
          {error || ' '}
        </span>
        {showStrength && strength && (
          <span
            className={`ln-password-strength ln-visible`}
            style={{ color: getStrengthColor(score) }}
          >
            Force : {strength}
          </span>
        )}
      </div>
    </label>
  );
};

export default LnPasswordField;
