import { useIcon } from "../../utils/iconImports";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('login');

  // Utilisation optimisée des icônes
  const { Icon: EyeIcon } = useIcon('Eye');
  const { Icon: EyeSlashIcon } = useIcon('EyeSlash'); 

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
          aria-label={t('showHidePassword')}
        >
          {visible ? 
            (EyeSlashIcon && <EyeSlashIcon />) : 
            (EyeIcon && <EyeIcon />)
          }
        </button>
      </div>

      <div className="ln-help">
        {t('login.passwordRules')}
      </div>

      <div className="ln-password-info">
        <span className={`ln-error ${error ? 'ln-visible' : 'ln-hidden'}`}>
          {error || ' '}
        </span>
        {showStrength && strength && (
          <span
            className="ln-password-strength ln-visible"
            style={{ color: getStrengthColor(score) }}
          >
            {t('login.passwordStrength', { strength })}
          </span>
        )}
      </div>
    </label>
  );
};

export default LnPasswordField;
