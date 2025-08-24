import React from "react";
import { useTranslation } from "react-i18next";

const CheckBox = ({ config, values, setValues, className }) => {
	const list = config?.list || [];
	const label = config?.label ?? "Sélection multiple";
	const { t } = useTranslation("modal");
	
	// Initialiser les valeurs si elles n'existent pas
	const currentValues = values[config?.key || 'selectedItems'] || [];
	
	const handleToggle = (item) => {
		const newValues = currentValues.includes(item)
			? currentValues.filter((i) => i !== item)
			: [...currentValues, item];
		
		setValues((prev) => ({
			...prev,
			[config?.key || 'selectedItems']: newValues
		}));
	};

	return (
		<div className="cf-field">
			{label !== "" && <h2>{t(label)}</h2>}
			<div className={`fsm-checkboxes ${className}`}>
				{list.map((item) => (
					<label key={item} className="fsm-checkbox-label">
						<input
							type="checkbox"
							checked={currentValues.includes(item)}
							onChange={() => handleToggle(item)}
						/>
						<span className="fsm-checkbox-text">{t(item)}</span>
					</label>
				))}
			</div>
		</div>
	);
};

export default CheckBox;
