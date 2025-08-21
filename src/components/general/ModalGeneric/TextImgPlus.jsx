import React from "react";
import { FaEye } from "react-icons/fa";
import { isValidImageUrl } from "@service";

const TextImgPlus = ({ config, values, setValues, handleChange, setPreviewSrc }) => {
	// Détecter combien de paires existent déjà
	const textKeyBase = "inputText";
	const urlKeyBase = "inputUrl";
	const textRegex = /^inputText(\d+)$/;
	const urlRegex = /^inputUrl(\d+)$/;

	const textIndexes = Object.keys(values)
		.filter((k) => textRegex.test(k))
		.map((k) => Number(k.replace(textKeyBase, "")))
		.filter((n) => !Number.isNaN(n));
	const urlIndexes = Object.keys(values)
		.filter((k) => urlRegex.test(k))
		.map((k) => Number(k.replace(urlKeyBase, "")))
		.filter((n) => !Number.isNaN(n));

	const existingCount = Math.max(
		textIndexes.length ? Math.max(...textIndexes) + 1 : 0,
		urlIndexes.length ? Math.max(...urlIndexes) + 1 : 0,
		1
	);

	const rows = Array.from({ length: existingCount }, (_, idx) => idx);

	const addRow = () => {
		// Ajoute une nouvelle paire vide
		const nextIndex = existingCount; // basé sur le comptage actuel
		const nextTextKey = `${textKeyBase}${nextIndex}`;
		const nextUrlKey = `${urlKeyBase}${nextIndex}`;
		setValues((prev) => ({ ...prev, [nextTextKey]: "", [nextUrlKey]: "" }));
	};

	const removeRow = (indexToRemove) => {
		if (existingCount <= 1) return; // Garder au moins une ligne
		
		const textKey = `${textKeyBase}${indexToRemove}`;
		const urlKey = `${urlKeyBase}${indexToRemove}`;
		
		setValues((prev) => {
			const newValues = { ...prev };
			delete newValues[textKey];
			delete newValues[urlKey];
			
			// Réorganiser les index pour éviter les trous
			const remainingTextKeys = Object.keys(newValues)
				.filter(k => textRegex.test(k))
				.sort((a, b) => {
					const aIndex = Number(a.replace(textKeyBase, ""));
					const bIndex = Number(b.replace(textKeyBase, ""));
					return aIndex - bIndex;
				});
			
			const remainingUrlKeys = Object.keys(newValues)
				.filter(k => urlRegex.test(k))
				.sort((a, b) => {
					const aIndex = Number(a.replace(urlKeyBase, ""));
					const bIndex = Number(b.replace(urlKeyBase, ""));
					return aIndex - bIndex;
				});
			
			// Recréer les clés avec des index séquentiels
			const reorganizedValues = {};
			Object.keys(newValues).forEach(key => {
				if (!textRegex.test(key) && !urlRegex.test(key)) {
					reorganizedValues[key] = newValues[key];
				}
			});
			
			remainingTextKeys.forEach((oldKey, newIndex) => {
				const newKey = `${textKeyBase}${newIndex}`;
				reorganizedValues[newKey] = newValues[oldKey];
			});
			
			remainingUrlKeys.forEach((oldKey, newIndex) => {
				const newKey = `${urlKeyBase}${newIndex}`;
				reorganizedValues[newKey] = newValues[oldKey];
			});
			
			return reorganizedValues;
		});
	};

	const label = config?.label ?? "Texte + Image";
	return (
		<div className="cf-field">
			<label className="tm-label label-fiche">{label}</label>
			{rows.map((idx) => {
				const textKey = `${textKeyBase}${idx}`;
				const urlKey = `${urlKeyBase}${idx}`;
				return (
					<div key={idx} className="shosho" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }} >
						{existingCount > 1 && (
							<button 
								type="button" 
								className="tm-secondary shoshote" 
								onClick={() => removeRow(idx)}
							>
								-
							</button>
						)}
						<div className="parentdodo">
							<div className="dada" >
								<label className="tm-label label-fiche" htmlFor={textKey}>Nom :</label>
								<input id={textKey} className="ficheText textparent" type="text" value={values[textKey] ?? ""} onChange={handleChange(textKey)} />
							</div>
							
							<div className="dodo">
								<label className="tm-label label-fiche" htmlFor={urlKey}>Image (URL) :
									{values[urlKey] && isValidImageUrl(values[urlKey]) && (
								<div style={{ marginLeft: 6, marginBottom:-6 }}>
									<FaEye
									style={{ cursor: "pointer", fontSize: 20 }}
									title="Voir l'aperçu"
									onClick={() => setPreviewSrc(values[urlKey])}
									/>
								</div>
								)}
								</label>
								<input id={urlKey} className="gugute" type="url" value={values[urlKey] ?? ""} onChange={handleChange(urlKey)} />
								
							</div>
						</div>
						
					</div>
				);
			})}
			<div style={{ display: "flex", justifyContent: "flex-start"  }} >
				<button type="button" className="tm-primary shoshote vd" onClick={addRow} >+</button>
			</div>
		</div>
	);
};

export default TextImgPlus;
