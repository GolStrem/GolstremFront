import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { BaseModal, ToolbarTipTap, TextImgPlus, TextTextAreaPlus, CheckBox, Chapter, ImgPlus  } from "@components";
import { isValidImageUrl, ApiService, ApiUnivers } from "@service";
import Cookies from "js-cookie";
import "../fiche/modal/FicheEditModal.css";
import "./ModalGeneric.css"
import { FaEye } from "react-icons/fa";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";


const ModalGeneric = ({ 
	onClose, 
	handleSubmit, 
	initialData = {}, 
	fields = {}, 
	name = "", 
	noClose = false, 
	isOpen = undefined, 
	title = undefined, 
	noButtonCancel= false, 
	textButtonValidate= 'save',
	nav = []
}) => {
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
			} else if (type === "img+") {
				// Détecter combien de champs URL existent déjà dans initialData
				const urlKeyBase = "inputUrl";
				const urlRegex = /^inputUrl(\d+)$/;

				const urlIndexes = Object.keys(initialData)
					.filter((k) => urlRegex.test(k))
					.map((k) => Number(k.replace(urlKeyBase, "")))
					.filter((n) => !Number.isNaN(n));

				const existingCount = Math.max(
					urlIndexes.length ? Math.max(...urlIndexes) + 1 : 0,
					1
				);

				// Créer tous les champs URL nécessaires
				for (let i = 0; i < existingCount; i++) {
					output[`inputUrl${i}`] = initialData[`inputUrl${i}`] ?? initialData.inputUrl ?? "";
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

	// Select embarqué pour certains champs (ex: img+)
	const [dynamicSelects, setDynamicSelects] = useState({});
	// Dossiers de gallerie récupérés via API par champ
	const [galleryFolders, setGalleryFolders] = useState({});

	// Gestion des selects génériques: options + saisie "Autre..."
	const [genericSelectOptions, setGenericSelectOptions] = useState({});
	const [genericShowOther, setGenericShowOther] = useState({});
	const [genericOtherInputs, setGenericOtherInputs] = useState({});

	useEffect(() => {
		// Initialise les selects dynamiques pour les champs concernés
		const initial = {};
		Object.entries(fields).forEach(([k, c]) => {
			if (c?.type === "img+") {
				initial[k] = {
					options: Array.isArray(c?.selectOptions) ? c.selectOptions : [],
					newValue: ""
				};
			}
		});
		setDynamicSelects(initial);
	}, [fields]);

	// Chargement des dossiers de galerie depuis l'API selon l'universId fourni par le formulaire
	useEffect(() => {
		const controller = new AbortController();
		const load = async () => {
			const updates = {};
			for (const [k, c] of Object.entries(fields)) {
				if (c?.type === "img+" && c?.galleryUniversIdKey) {
					const universId = values[c.galleryUniversIdKey];
					if (!universId) continue;
					try {
						const res = await ApiUnivers.getFolderGallerie(universId);
						const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
						updates[k] = list;
					} catch (e) {
						console.error("Erreur chargement folders gallerie", e);
						updates[k] = [];
					}
				}
			}
			if (Object.keys(updates).length > 0) {
				setGalleryFolders((prev) => ({ ...prev, ...updates }));
			}
		};
		load();
		return () => controller.abort();
	}, [fields, values]);

	useEffect(() => {
		// Initialise les options locales pour les selects génériques
		const initial = {};
		Object.entries(fields).forEach(([k, c]) => {
			if (c?.type === "select") {
				initial[k] = Array.isArray(c.value) ? c.value : [];
			}
		});
		setGenericSelectOptions(initial);
		setGenericShowOther({});
		setGenericOtherInputs({});
	}, [fields]);

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
		console.log(config)
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
			case "img+":
				console.log("ouiii")
				return (
					<div key={key} className="cf-field">
						<ImgPlus 
							config={config}
							values={values}
							setValues={setValues}
							handleChange={handleChange}
							setPreviewSrc={setPreviewSrc}
						/>
						{/* Select API dossiers galerie si demandé */}
						{config?.galleryUniversIdKey && (
							<div className={`selectGeneric ${key}-gallery-select`} style={{ marginTop: 8 }}>
								{(config?.gallerySelectLabel ?? "") !== "" && (
									<label className={`label-${key}-gallery`} htmlFor={`gallery-select-${key}`}>
										{config.gallerySelectLabel}
									</label>
								)}
								<select
									id={`gallery-select-${key}`}
									name={`${key}-gallery-select`}
									className={`filter-select select-${key}-gallery`}
									value={values[config?.gallerySelectKey || `${key}Folder`] || ""}
									onChange={(e) => setValues((prev) => ({ ...prev, [config?.gallerySelectKey || `${key}Folder`]: e.target.value }))}
									disabled={!Array.isArray(galleryFolders[key]) || galleryFolders[key].length === 0}
								>
									{Array.isArray(galleryFolders[key]) && galleryFolders[key].map((folder, idx) => (
										<option key={`${key}-gallery-opt-${idx}`} value={folder}>{folder}</option>
									))}
								</select>
							</div>
						)}
						{/* Select embarqué avec ajout d'options */}
						{dynamicSelects[key] && (
							<div className={`selectGeneric ${key}-embedded-select`}>
								{(config?.selectLabel ?? "") !== "" && (
									<label className={`label-${key}-embedded`} htmlFor={`embedded-select-${key}`}>
										{config.selectLabel}
									</label>
								)}
								<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
									<select
										id={`embedded-select-${key}`}
										name={`${key}-embedded-select`}
										className={`filter-select select-${key}-embedded`}
										value={values[config?.selectKey || `${key}Select`] || ""}
										onChange={(e) => {
											const val = e.target.value;
											setValues((prev) => ({ ...prev, [config?.selectKey || `${key}Select`]: val }));
										}}
									>
										{dynamicSelects[key].options.map((val, idx) => (
											<option key={`${key}-emb-opt-${idx}`} value={val}>{val}</option>
										))}
									</select>
									<input 
										type="text" 
										value={dynamicSelects[key].newValue}
										onChange={(e) => setDynamicSelects((prev) => ({
											...prev,
											[key]: { ...prev[key], newValue: e.target.value }
										}))}
										placeholder="Ajouter une option..."
									/>
									<button 
										type="button"
										onClick={() => {
											const toAdd = (dynamicSelects[key].newValue || "").trim();
											if (!toAdd) return;
											setDynamicSelects((prev) => ({
												...prev,
												[key]: { options: [...prev[key].options, toAdd], newValue: "" }
											}));
											setValues((prev) => ({ ...prev, [config?.selectKey || `${key}Select`]: toAdd }));
										}}
									>
										Ajouter
									</button>
								</div>
							</div>
						)}
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
			const opts = Array.isArray(genericSelectOptions[key]) ? genericSelectOptions[key] : (Array.isArray(config.value) ? config.value : []);
			const isOther = !!genericShowOther[key];
			return (
				<div key={key} className={`selectGeneric ${key}`} style={{ position: 'relative' }}>
				{config.label !== "" && <label htmlFor={id} className={`label-${key}`}>{config.label}</label>}

				<select 
					id={id} 
					name={key} 
					className={`filter-select select-${key}`}
					value={isOther ? "__other__" : (values[key] || "")}
					onChange={(e) => {
						const val = e.target.value;
						if (val === "__other__") {
							setGenericShowOther((prev) => ({ ...prev, [key]: true }));
							setGenericOtherInputs((prev) => ({ ...prev, [key]: "" }));
						} else {
							setGenericShowOther((prev) => ({ ...prev, [key]: false }));
							setValues((prev) => ({ ...prev, [key]: val }));
						}
					}}
				>
					{opts.map((val, idx) => (
						<option key={`${key}-opt-${idx}`} value={val}>
						{val}
						</option>
					))}
					<option value="__other__">Autre...</option>
				</select>

				{isOther && (
					<input
						type="text"
						value={genericOtherInputs[key] || ""}
						onChange={(e) => setGenericOtherInputs((prev) => ({ ...prev, [key]: e.target.value }))}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								const newVal = (genericOtherInputs[key] || "").trim();
								if (!newVal) return;
								setGenericSelectOptions((prev) => ({ ...prev, [key]: [...(prev[key] || opts), newVal] }));
								setValues((prev) => ({ ...prev, [key]: newVal }));
								setGenericShowOther((prev) => ({ ...prev, [key]: false }));
								setGenericOtherInputs((prev) => ({ ...prev, [key]: "" }));
							}
						}}
						onBlur={() => {
							const newVal = (genericOtherInputs[key] || "").trim();
							if (newVal) {
								setGenericSelectOptions((prev) => ({ ...prev, [key]: [...(prev[key] || opts), newVal] }));
								setValues((prev) => ({ ...prev, [key]: newVal }));
							}
							setGenericShowOther((prev) => ({ ...prev, [key]: false }));
							setGenericOtherInputs((prev) => ({ ...prev, [key]: "" }));
						}}
						style={{
							position: 'absolute',
							top: config.label !== "" ? 28 : 0,
							left: 0,
							right: 0,
							height: '100%',
							padding: '8px 12px',
							border: '1px solid #ccc',
							borderRadius: 4,
							background: 'white',
							zIndex: 2
						}}
						placeholder="Saisir autre..."
					/>
				)}
				</div>
			);
			}
			default:
			return null;

		}
	};

	const closeBefore = (handle) => () => {
		handleClose()
		handle()
	}

	return (
		<BaseModal onClose={handleClose} className={`tmedit cf-modal-large master-${name}`} noClose={noClose}>
			<div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginBottom: '20px' }}>
				{nav.map((item) => (
					<button key={item.name} onClick={closeBefore(item.handle)} className="button-nav-uni" title={item.name}>
						{item.html}
					</button>
				))}
			</div>
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