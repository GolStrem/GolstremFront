const LnInput = ({ label, name, type = 'text', value, onChange, error, ...rest }) => (
  <label>
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      {...rest}
    />
    <span className={`ln-error ${error ? 'ln-visible' : 'ln-hidden'}`}>
      {error || ' '}
    </span>
  </label>
);

export default LnInput;
