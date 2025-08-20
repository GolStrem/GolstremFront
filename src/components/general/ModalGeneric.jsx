import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { BaseModal, ToolbarTipTap } from "@components";
import { isValidImageUrl, ApiService } from "@service";
import Cookies from "js-cookie";
import "../fiche/modal/FicheEditModal.css";
import "./ModalGeneric.css"
import { FaEye } from "react-icons/fa";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";



const ModalGeneric = ({ onClose, handleSubmit, initialData = {}, fields = {}, name = "", noClose = false }) => {
	const textareasRef = useRef([]);
	const [previewSrc, setPreviewSrc] = useState(null);
	
	// Référence pour forcer la mise à jour des éditeurs
	const forceUpdateRef = useRef(0);

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
			} else {
				output[key] = initialData[key] ?? "";
			}
	});
				

// Retourne output original (non modifié immédiatement)
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
		// Éviter la boucle infinie
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

	// Forcer la mise à jour des éditeurs quand les valeurs changent (après traitement des alias)
	useEffect(() => {
		// Incrémenter le compteur pour forcer la mise à jour des éditeurs
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
	}, [fields]);

	useLayoutEffect(() => {
		textareasRef.current = [];

		// récupérer tous les textarea du DOM de cette modale
		const textareas = document.querySelectorAll(".tmedit textarea");

		// garder toutes les fonctions resize pour cleanup
		const cleanupFns = [];

		textareas.forEach((textarea) => {
		// ajouter à la ref
		textareasRef.current.push(textarea);

		const resize = () => {
		textarea.style.height = "auto"; 
		textarea.style.height = textarea.scrollHeight + "px";
		};
		resize();
		textarea.addEventListener("input", resize);
		cleanupFns.push(() => textarea.removeEventListener("input", resize));
		});

		return () => {
		cleanupFns.forEach((fn) => fn());
		};
	}, [values]); // relance si le contenu change




	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (key) => (e) => {
		const nextValue = e?.target?.value ?? "";
		setValues((prev) => ({ ...prev, [key]: nextValue }));
	};

	const onSubmit = async () => {
		setError("");
		setLoading(true);
		try {
			await Promise.resolve(handleSave?.(values));
			onClose?.(); // Utiliser onClose directement au lieu de handleClose
		} catch (e) {
			console.error("Erreur de sauvegarde:", e);
			setError("Impossible de sauvegarder.");
		} finally {
			setLoading(false);
		}
	};

	const renderTexteImgPlus = (config) => {
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

	const renderChapter = (config) => {
		// Détecter uniquement les chapitres qui commencent par nC-
		const chapterKeys = Object.keys(values).filter(key => key.startsWith("nC-"));
		const existingCount = chapterKeys.length || 1;

		// État pour le chapitre actuellement affiché (utiliser la clé au lieu de l'index)
		const [currentChapterKey, setCurrentChapterKey] = useState(() => {
			// Initialiser avec le premier chapitre disponible
			return chapterKeys.length > 0 ? chapterKeys[0] : null;
		});

		// État temporaire pour le nom en cours de saisie
		const [editingNames, setEditingNames] = useState({});

		// État pour préserver l'ordre des chapitres
		const [chapterOrder, setChapterOrder] = useState(() => {
			// Initialiser avec l'ordre actuel
			return [...chapterKeys];
		});

		// Mettre à jour la clé courante si elle n'existe plus
		useEffect(() => {
			if (!currentChapterKey || !chapterKeys.includes(currentChapterKey)) {
				setCurrentChapterKey(chapterKeys.length > 0 ? chapterKeys[0] : null);
			}
		}, [chapterKeys, currentChapterKey]);

		// Initialiser les noms en cours d'édition - seulement quand chapterKeys change vraiment
		useEffect(() => {
			const newEditingNames = {};
			let hasChanges = false;
			
			chapterKeys.forEach(key => {
				const cleanTitle = getCleanTitle(key);
				if (!editingNames[key]) {
					newEditingNames[key] = cleanTitle;
					hasChanges = true;
				}
			});
			
			// Ne mettre à jour que s'il y a de vrais changements
			if (hasChanges) {
				setEditingNames(prev => ({ ...prev, ...newEditingNames }));
			}
		}, [chapterKeys]); // Retirer editingNames des dépendances

		// Mettre à jour l'ordre des chapitres quand de nouveaux sont ajoutés
		useEffect(() => {
			const newKeys = chapterKeys.filter(key => !chapterOrder.includes(key));
			if (newKeys.length > 0) {
				setChapterOrder(prev => [...prev, ...newKeys]);
			}
		}, [chapterKeys, chapterOrder]);

		const addChapter = () => {
			const nextIndex = existingCount;
			const nextKey = `nC-chapitre${nextIndex}`;
			setValues((prev) => ({ ...prev, [nextKey]: "" }));
			// Changer directement vers le nouveau chapitre
			setCurrentChapterKey(nextKey);
		};

		const removeChapter = (keyToRemove) => {
			if (existingCount <= 1) return; // Garder au moins un chapitre
			
			setValues((prev) => {
				const newValues = { ...prev };
				delete newValues[keyToRemove];
				return newValues;
			});

			// Retirer de l'ordre
			setChapterOrder(prev => prev.filter(key => key !== keyToRemove));

			// Ajuster la clé du chapitre affiché si nécessaire
			if (keyToRemove === currentChapterKey) {
				const remainingKeys = chapterOrder.filter(key => key !== keyToRemove);
				setCurrentChapterKey(remainingKeys.length > 0 ? remainingKeys[0] : null);
			}
		};

		const handleChapterChange = (e) => {
			const selectedKey = e.target.value;
			setCurrentChapterKey(selectedKey);
		};

		// Fonction pour nettoyer le titre (enlever nC-)
		const getCleanTitle = (key) => {
			return key.replace(/^nC-/, "");
		};

		// Composant pour un chapitre individuel
		const ChapterEditor = ({ chapterKey, isVisible, displayName, onNameChange, onNameBlur, onRemove, existingCount }) => {
			const editor = useEditor({
				extensions: [StarterKit],
				content: values[chapterKey] || "",
				onUpdate: ({ editor }) => {
					handleChange(chapterKey)({ target: { value: editor.getHTML() } });
				},
			});

			// Mettre à jour le contenu de l'éditeur quand values change
			useEffect(() => {
				if (editor && editor.getHTML() !== values[chapterKey]) {
					editor.commands.setContent(values[chapterKey] || '');
				}
			}, [values[chapterKey], editor, forceUpdateRef.current]);

			// Forcer la mise à jour du contenu quand l'éditeur devient visible
			useEffect(() => {
				if (isVisible && editor) {
					editor.commands.setContent(values[chapterKey] || '');
				}
			}, [isVisible, editor, values[chapterKey]]);

			return (
				<div 
					style={{ 
						marginBottom: 16, 
						
						display: isVisible ? "block" : "none"
					}}
				>
					<div className="cf-field short" style={{ marginBottom: 12 }}>
						<label className="tm-label label-fiche" htmlFor={`${chapterKey}_name`}>Nom du chapitre :</label>
						<div className="boitecha">
							<input 
								id={`${chapterKey}_name`} 
								type="text" 
								value={displayName} 
								onChange={(e) => onNameChange(chapterKey, e.target.value)}
								onBlur={() => onNameBlur(chapterKey)}
								placeholder="Nom du chapitre"
							/>
							{existingCount > 1 && (
								<button 
									type="button" 
									className="tm-secondary shoshot" 
									onClick={() => onRemove(chapterKey)}
									style={{ padding: "6px 10px" }}
									
								>
									-
								</button>
							)}
						</div>
					</div>
					<div className="cf-field">
						<label className="tm-label label-about" htmlFor={`${chapterKey}_text`}>Texte du chapitre :</label>
						<ToolbarTipTap editor={editor} />
						<EditorContent editor={editor} className="tiptap-editor editChapter" />
					</div>
				</div>
			);
		};

		// Fonction pour gérer le changement de nom du chapitre (mise à jour en temps réel)
		const handleChapterNameChange = (oldKey, newName) => {
			// Mettre à jour le nom en cours d'édition
			setEditingNames(prev => ({
				...prev,
				[oldKey]: newName
			}));
		};

		// Fonction pour valider le nom du chapitre (appelée lors de la perte de focus)
		const handleChapterNameBlur = (oldKey) => {
			const newName = editingNames[oldKey];
			
			// Permettre les espaces et les caractères spéciaux, mais pas de nom complètement vide
			if (!newName || newName.trim() === "") {
				// Remettre l'ancien nom si vide
				setEditingNames(prev => ({
					...prev,
					[oldKey]: getCleanTitle(oldKey)
				}));
				return;
			}
			
			const newKey = `nC-${newName}`; // Garder les espaces et caractères tels quels
			
			// Éviter de créer une clé identique
			if (newKey === oldKey) return;
			
			// Créer un mapping pour préserver l'ordre dans values
			setValues((prev) => {
				const newValues = {};
				
				// Préserver l'ordre en recréant l'objet dans le bon ordre
				chapterOrder.forEach(key => {
					if (key === oldKey) {
						newValues[newKey] = prev[oldKey]; // Nouvelle clé avec l'ancien contenu
					} else {
						newValues[key] = prev[key]; // Garder les autres clés
					}
				});
				
				// Ajouter les autres propriétés non-chapitre
				Object.keys(prev).forEach(key => {
					if (!key.startsWith("nC-")) {
						newValues[key] = prev[key];
					}
				});
				
				return newValues;
			});

			// Mettre à jour l'ordre des chapitres (remplacer l'ancienne clé par la nouvelle)
			setChapterOrder(prev => prev.map(key => key === oldKey ? newKey : key));

			// Mettre à jour la clé courante si c'était le chapitre affiché
			if (oldKey === currentChapterKey) {
				setCurrentChapterKey(newKey);
			}

			// Mettre à jour les noms en cours d'édition avec la nouvelle clé
			setEditingNames(prev => {
				const newEditing = { ...prev };
				delete newEditing[oldKey];
				newEditing[newKey] = newName;
				return newEditing;
			});
		};

		const label = config?.label ?? "Chapitres";
		return (
			<div className="cf-field">
				
				<label className="tm-label label-fiche">{label}</label>
				
				{/* Sélecteur de chapitre */}
				<div className="cf-field short bobo" style={{ marginBottom: 16 }}>
					<label className="tm-label label-fiche">Sélectionner un chapitre :</label>
					<div className=" boitecho">
						<select 
							value={currentChapterKey || ""} 
							onChange={handleChapterChange}
							style={{ 
								padding: "8px", 
								borderRadius: "4px", 
								border: "1px solid #ddd", 
								width: "40%",
								backgroundColor:"var(--color-input-bg)"
							}}
							className="selectbo"
						>
							{chapterOrder.map((key) => {
								// Afficher le nom édité s'il existe, sinon le nom original
								const displayName = editingNames[key] || getCleanTitle(key);
								return (
									<option key={key} value={key}>
										{displayName}
									</option>
								);
							})}
						</select>
						<button type="button" className="tm-primary shoshotel" onClick={addChapter}>+</button>
					</div>
				</div>

				{/* Affichage du chapitre sélectionné */}
				{chapterOrder.map((key, index) => {
					const isVisible = key === currentChapterKey;
					const displayName = editingNames[key] || getCleanTitle(key);
					
					return (
						<ChapterEditor
							key={`chapter-${index}`}
							chapterKey={key}
							isVisible={isVisible}
							displayName={displayName}
							onNameChange={handleChapterNameChange}
							onNameBlur={handleChapterNameBlur}
							onRemove={removeChapter}
							existingCount={existingCount}
						/>
					);
				})}
				
			</div>
		);
	};

	const renderField = (key, config) => {
		const id = key;
		const label = config?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
		switch (config?.type) {
			case "inputText":
				return (
					<div key={key} className="cf-field short">
						<label className="tm-label label-fiche" htmlFor={id}>
							{label} :
						</label>
						<input id={id} type="text" value={values[key]} onChange={handleChange(key)} />
					</div>
				);
			case "inputUrl":
				return (
					<div key={key} className="cf-field short">
						<label className="tm-label label-fiche  " htmlFor={id}>
						{label} :
						{values[key] && isValidImageUrl(values[key]) && (
						<div style={{ marginLeft: 6, marginBottom:-6 }}>
							<FaEye
							style={{ cursor: "pointer", fontSize: 20 }}
							title="Voir l'aperçu"
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
						placeholder="Collez l'URL de l'image"
						/>	
					</div>
					);
			case "textarea":
				const editor = useEditor({
					extensions: [StarterKit],
					content: values[key] || "", // valeur initiale
					onUpdate: ({ editor }) => {
					handleChange(key)({ target: { value: editor.getHTML() } }); // on simule un event pour ton handleChange
					},
				});

				// Mettre à jour le contenu de l'éditeur quand values change
				useEffect(() => {
					if (editor && editor.getHTML() !== values[key]) {
						editor.commands.setContent(values[key] || '');
					}
				}, [values[key], editor, forceUpdateRef.current]);

				return (
					<div key={key} className="cf-generic">
						<label className="tm-label label-about" htmlFor={id}>
							{label} :
						</label>
						 <ToolbarTipTap editor={editor} />
						<EditorContent editor={editor} className="tiptap-editor" />
					</div>
				);
			case "texteImg+":
				return (
					<div key={key} className="cf-field">
						{renderTexteImgPlus(config)}
					</div>
				);
			case "chapter":
				
				return (
					<div key={key} className="cf-field">
						{renderChapter(config)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<BaseModal onClose={handleClose} className="tmedit cf-modal-large" noClose={noClose}>
			<h2 className="modal-title">Édition</h2>
			<form className="tm-modal-form" onSubmit={(e) => e.preventDefault()}>
				{Object.entries(fields).map(([key, config]) => renderField(key, config))}
			</form>
			{error && <span className="tm-error">{error}</span>}
			<div className="tm-modal-buttons">
				<button className="tm-primary" onClick={onSubmit} disabled={loading}>
					{loading ? "Sauvegarde..." : "Enregistrer"}
				</button>
				<button onClick={handleClose} disabled={loading}>Annuler</button>
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
				alt="Aperçu"
				style={{ maxHeight: "90%", maxWidth: "90%", borderRadius: 8 }}
				onClick={(e) => e.stopPropagation()} // empêcher la fermeture au clic sur l'image
				/>
			</div>
			)}
		</BaseModal>
	);
};

export default ModalGeneric;


