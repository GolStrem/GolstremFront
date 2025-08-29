import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { BaseModal, ToolbarTipTap, TextImgPlus, TextTextAreaPlus, CheckBox, Chapter  } from "@components";
import { isValidImageUrl, ApiService } from "@service";
import Cookies from "js-cookie";
import "../fiche/modal/FicheEditModal.css";
import "./ModalGeneric.css"
import { FaEye } from "react-icons/fa";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";


const ModalGeneric = ({ onClose, handleSubmit, initialData = {}, fields = {}, name = "", noClose = false, isOpen = undefined, title = undefined, noButtonCancel= false, textButtonValidate= 'save' }) => {
	if (isOpen !== undefined && !isOpen) return null;
	
	const [previewSrc, setPreviewSrc] = useState(null);
	const forceUpdateRef = useRef(0);
	const { t } = useTranslation("modal");
	

	const [values, setValues] = useState(() => {

		const cookie = Cookies.get(name)
		if (cookie) {
			return JSON.parse(cookie)
		}

		const output = {};
		Object.keys(fields).forEach((key) => {
			const type = fields[key]?.type;
			if (type === "texteImg+") {
				// Détecter combien de paires existent déjà dans initialData
				const textKeyBase = "inputText";
				const urlKeyBase = "inputUrl";
				const textRegex = /^inputText(\d+)$/;
				const urlRegex = /^inputUrl(\d+)$/;

				const textIndexes = Object.keys(initialData)
					.filter((k) => textRegex.test(k))
					.map((k) => Number(k.replace(textKeyBase, "")))
					.filter((n) => !Number.isNaN(n));
				const urlIndexes = Object.keys(initialData)
					.filter((k) => urlRegex.test(k))
					.map((k) => Number(k.replace(urlKeyBase, "")))
					.filter((n) => !Number.isNaN(n));

				const existingCount = Math.max(
					textIndexes.length ? Math.max(...textIndexes) + 1 : 0,
					urlIndexes.length ? Math.max(...urlIndexes) + 1 : 0,
					1
				);

				// Créer toutes les paires nécessaires
				for (let i = 0; i < existingCount; i++) {
					output[`inputText${i}`] = initialData[`inputText${i}`] ?? initialData.inputText ?? "";
					output[`inputUrl${i}`] = initialData[`inputUrl${i}`] ?? initialData.inputUrl ?? "";
				}
			} else if (type === "textTextArea+") {
				// Détecter combien de paires existent déjà dans initialData
				const textKeyBase = "inputText";
				const textareaKeyBase = "inputTextarea";
				const textRegex = /^inputText(\d+)$/;
				const textareaRegex = /^inputTextarea(\d+)$/;

				const textIndexes = Object.keys(initialData)
					.filter((k) => textRegex.test(k))
					.map((k) => Number(k.replace(textKeyBase, "")))
					.filter((n) => !Number.isNaN(n));
				const textareaIndexes = Object.keys(initialData)
					.filter((k) => textareaRegex.test(k))
					.map((k) => Number(k.replace(textareaKeyBase, "")))
					.filter((n) => !Number.isNaN(n));

				const existingCount = Math.max(
					textIndexes.length ? Math.max(...textIndexes) + 1 : 0,
					textareaIndexes.length ? Math.max(...textareaIndexes) + 1 : 0,
					1
				);

				// Créer toutes les paires nécessaires
				for (let i = 0; i < existingCount; i++) {
					output[`inputText${i}`] = initialData[`inputText${i}`] ?? initialData.inputText ?? "";
					output[`inputTextarea${i}`] = initialData[`inputTextarea${i}`] ?? initialData.inputTextarea ?? "";
				}
			} else if (type === "chapter") {
				// Gérer les chapitres - accepter tous les formats de clés
				const allKeys = Object.keys(initialData);
				if (allKeys.length > 0) {
					allKeys.forEach(key => {
						output[key] = initialData[key] ?? "";
					});
				} else {
					// Au moins un chapitre par défaut
					output["nC-introduction"] = "";
				}
			} else if (type === "checkBox") {
				// Gérer les checkboxes - s'assurer qu'on a un tableau
				const configKey = fields[key]?.key || 'selectedItems';
				output[configKey] = initialData[configKey] || [];
			} else {
				output[key] = initialData[key] ?? "";
			}
	});
				

		return output;
	});

	const handleClose = () => {
		Cookies.set(name, JSON.stringify(values), { expires: 0.0208 }); 
		onClose()
	}

	const handleSave = (values) => {
		handleSubmit(values)
		Cookies.remove(name)
	}

	// Référence pour éviter la boucle infinie
	const isProcessingAliases = useRef(false);

	useEffect(() => {
		if (isProcessingAliases.current) return;
		
		const searchAlias = async () => {
			const aliasRegex = /\$\$(\d+)\$\$/g;
			const foundNumbers = new Set();

			Object.values(values).forEach((val) => {
				if (typeof val === "string") {
					let match;
					while ((match = aliasRegex.exec(val)) !== null) {
						foundNumbers.add(match[1]); // match[1] = le nombre sans les $$
					}
				}
			});
			
			// S'il n'y a pas d'alias, ne rien faire
			if (foundNumbers.size === 0) return;
			
			isProcessingAliases.current = true;
			
			try {
				const aliasModule = await ApiService.getAliasModule(Array.from(foundNumbers))
				const aliasMap = aliasModule.data;

				// On remplace dans values
				const replacedValues = Object.fromEntries(
					Object.entries(values).map(([key, val]) => {
						if (typeof val === "string") {
							return [
								key,
								val.replace(aliasRegex, (_, num) => aliasMap[num] || `$$${num}$$`)
							];
						}
						return [key, val];
					})
				);
				setValues(replacedValues)
			} catch (error) {
				console.error("Erreur lors du traitement des alias:", error);
			} finally {
				isProcessingAliases.current = false;
			}
		}

		searchAlias()
	}, [values])

	useEffect(() => {
		forceUpdateRef.current += 1;
	}, [values])

	useEffect(() => {
		// S'assure qu'au moins inputText0/inputUrl0 existent si texteImg+ est demandé
		const hasTexteImg = Object.values(fields).some((c) => c?.type === "texteImg+");
		if (hasTexteImg && (values.inputText0 === undefined || values.inputUrl0 === undefined)) {
			setValues((prev) => ({
				...prev,
				inputText0: prev.inputText0 ?? "",
				inputUrl0: prev.inputUrl0 ?? "",
			}));
		}

		// S'assure qu'au moins inputText0/inputTextarea0 existent si textTextArea+ est demandé
		const hasTextTextArea = Object.values(fields).some((c) => c?.type === "textTextArea+");
		if (hasTextTextArea && (values.inputText0 === undefined || values.inputTextarea0 === undefined)) {
			setValues((prev) => ({
				...prev,
				inputText0: prev.inputText0 ?? "",
				inputTextarea0: prev.inputTextarea0 ?? "",
			}));
		}

		// S'assure que les checkboxes sont initialisées
		const hasCheckBox = Object.values(fields).some((c) => c?.type === "checkBox");
		if (hasCheckBox) {
			const checkBoxFields = Object.entries(fields).filter(([key, config]) => config?.type === "checkBox");
			const updates = {};
			let hasUpdates = false;

			checkBoxFields.forEach(([key, config]) => {
				const configKey = config?.key || 'selectedItems';
				if (values[configKey] === undefined) {
					updates[configKey] = [];
					hasUpdates = true;
				}
			});

			if (hasUpdates) {
				setValues((prev) => ({
					...prev,
					...updates
				}));
			}
		}
	}, [fields]);


	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (key) => (e) => {
		const nextValue = e?.target?.value ?? "";
		setValues((prev) => ({ ...prev, [key]: nextValue }));
	};

	// Fonction pour vérifier si tous les champs URL sont valides
	const validateAllUrlFields = () => {
		// Vérifier les champs inputUrl simples
		const urlFields = Object.entries(fields).filter(([key, config]) => config?.type === "inputUrl");
		for (const [key] of urlFields) {
			if (values[key] && !isValidImageUrl(values[key])) {
				return false;
			}
		}

		// Vérifier les champs dans les composants texteImg+
		const texteImgFields = Object.entries(fields).filter(([key, config]) => config?.type === "texteImg+");
		for (const [key] of texteImgFields) {
			const urlRegex = /^inputUrl(\d+)$/;
			const urlKeys = Object.keys(values).filter(k => urlRegex.test(k));
			for (const urlKey of urlKeys) {
				if (values[urlKey] && !isValidImageUrl(values[urlKey])) {
					return false;
				}
			}
		}

		return true;
	};

	const onSubmit = async () => {
		// Vérifier la validation avant de soumettre
		if (!validateAllUrlFields()) {
			setError("Veuillez corriger les URLs d'images invalides avant de continuer.");
			return;
		}

		setError("");
		setLoading(true);
		try {
			await Promise.resolve(handleSave?.(values));
			onClose?.();
		} catch (e) {
			console.error("Erreur de sauvegarde:", e);
			setError("Impossible de sauvegarder.");
		} finally {
			setLoading(false);
		}
	};


	const renderField = (key, config) => {
		const id = key;
		const label = config?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
		switch (config?.type) {
			case "inputText":
				return (
					<div key={key} className="cf-field short">
						<label className="tm-label label-fiche" htmlFor={id}>
							{t(label)} :
						</label>
						<input id={id} type="text" value={values[key]} onChange={handleChange(key)} />
					</div>
				);
			case "inputUrl":
				const isUrlValid = !values[key] || isValidImageUrl(values[key]);
				return (
					<div key={key} className="cf-field short">
						<label className="tm-label label-fiche  " htmlFor={id}>
						{t(label)} :
						{values[key] && isValidImageUrl(values[key]) && (
						<div style={{ marginLeft: 6, marginBottom:-6 }}>
							                                    <FaEye size={16}
              style={{ cursor: "pointer", fontSize: 20 }}
              title={t("preview")}
              onClick={() => setPreviewSrc(values[key])}
            />
						</div>
						)}
						</label>
						<input
						id={id}
						type="url"
						value={values[key]}
						onChange={handleChange(key)}
						placeholder={t("pasteUrl")}
						style={{
							border: isUrlValid ? undefined : '2px solid #ff4444',
							borderRadius: isUrlValid ? undefined : '4px'
						}}
						/>
						{values[key] && !isValidImageUrl(values[key]) && (
							<div style={{ 
								color: '#ff4444', 
								fontSize: '12px', 
								marginTop: '4px',
								fontStyle: 'italic'
							}}>
								{t("invalidUrl")}
							</div>
						)}
					</div>
					);
			case "textarea":
				const editor = useEditor({
					extensions: [StarterKit],
					content: values[key] || "",
					onUpdate: ({ editor }) => {
					handleChange(key)({ target: { value: editor.getHTML() } }); 
					},
				});

				useEffect(() => {
					if (editor && editor.getHTML() !== values[key]) {
						editor.commands.setContent(values[key] || '');
					}
				}, [values[key], editor, forceUpdateRef.current]);

				return (
					<div key={key} className="cf-generic">
						<label className="tm-label label-about" htmlFor={id}>
							{t(label)} :
						</label>
						 <ToolbarTipTap editor={editor} />
						<EditorContent editor={editor} className="tiptap-editor" />
					</div>
				);
			case "texteImg+":
				return (
					<div key={key} className="cf-field">
						<TextImgPlus 
							config={config}
							values={values}
							setValues={setValues}
							handleChange={handleChange}
							setPreviewSrc={setPreviewSrc}
						/>
					</div>
				);
			case "textTextArea+":
					return (
						<div key={key} className="cf-field">
							<TextTextAreaPlus 
								config={config}
								values={values}
								setValues={setValues}
								handleChange={handleChange}
								forceUpdateRef={forceUpdateRef}
							/>
						</div>
			);
			case "chapter":
				return (
					<div key={key} className="cf-field">
						<Chapter 
							config={config}
							values={values}
							setValues={setValues}
							handleChange={handleChange}
							forceUpdateRef={forceUpdateRef}
						/>
					</div>
				);
			case "checkBox":
				return (
					<div key={key} className={`cf-field`}>
						<CheckBox 
							config={config}
							values={values}
							setValues={setValues}
							className={key}
						/>
					</div>
				);
			case "image":
				return(
					<div key={key} className={`imageGeneric ${key}`}>
						<img src={config.value} />
					</div>
				);
			case "tags":
				return (
					<div key={key} id="tagsUnivers" className={`tagGeneric ${key}`}>
					{config.value.map((val, index) => (
						<div key={index} className={`miniTag ${val}`}>
						{val}
						</div>
					))}
					</div>
				);
			case "html":
				return (
					<div
					key={key}
					className={`htmlGeneric ${key}`}
					dangerouslySetInnerHTML={{ __html: config.value }}
					/>
				);
			case "select": {
			const id = `select-${key}`;
			return (
				<div key={key} className={`selectGeneric ${key}`}>
				{config.label !== "" && <label htmlFor={id} className={`label-${key}`}>{config.label}</label>}

				<select 
					id={id} 
					name={key} 
					className={`filter-select select-${key}`}
					value={values[key] || ""}
					onChange={handleChange(key)}
				>
					{Array.isArray(config.value) &&
					config.value.map((val, idx) => (
						<option key={`${key}-opt-${idx}`} value={val}>
						{val}
						</option>
					))}
				</select>
				</div>
			);
			}
			default:
			return null;

		}
	};

	return (
		<BaseModal onClose={handleClose} className={`tmedit cf-modal-large master-${name}`} noClose={noClose}>
			{title && <h2 className={`h2-${name}`}>{t(title)}</h2>}
			<form className={`tm-modal-form ${name}`} onSubmit={(e) => e.preventDefault()}>
				{Object.entries(fields).map(([key, config]) => renderField(key, config))}
			</form>
			{error && <span className="tm-error">{error}</span>}
			<div className="tm-modal-buttons">
				<button 
					className="tm-primary" 
					onClick={onSubmit} 
					disabled={loading || !validateAllUrlFields()}
					title={!validateAllUrlFields() ? t("invalidUrlList") : ""}
				>
					{loading ? t("saving") : t(textButtonValidate)}
				</button>
				{ !noButtonCancel &&  (
					<button onClick={handleClose} disabled={loading}>{t("cancel")}</button>
				)}
			</div>

			{/* Modal d'aperçu */}
			{previewSrc && (
			<div
				className="image-preview-overlay"
				onClick={() => setPreviewSrc(null)}
				style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.7)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 9999,
				}}
			>
				<img
				src={previewSrc}
				alt={t("preview")}
				style={{ maxHeight: "90%", maxWidth: "90%", borderRadius: 8 }}
				onClick={(e) => e.stopPropagation()} // empêcher la fermeture au clic sur l'image
				/>
			</div>
			)}
		</BaseModal>
	);
};

export default ModalGeneric;