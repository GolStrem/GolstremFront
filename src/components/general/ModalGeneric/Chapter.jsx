import React, { useEffect, useState, useCallback } from "react";
import { ToolbarTipTap } from "@components";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Composant pour un chapitre individuel - défini en dehors pour éviter les re-renders
const ChapterEditor = React.memo(({ 
	chapterKey, 
	isVisible, 
	displayName, 
	onNameChange, 
	onNameBlur, 
	onRemove, 
	existingCount,
	values,
	handleChange,
	forceUpdateRef
}) => {
	const editor = useEditor({
		extensions: [StarterKit],
		content: values[chapterKey] || "",
		onBlur: () => {
			// Mettre à jour values seulement quand on sort du focus
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
						className="chapterName" 
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
});

const Chapter = ({ config, values, setValues, handleChange, forceUpdateRef }) => {
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

	// Mettre à jour l'ordre des chapitres quand de nouveaux sont ajoutés
	useEffect(() => {
		const newKeys = chapterKeys.filter(key => !chapterOrder.includes(key));
		if (newKeys.length > 0) {
			setChapterOrder(prev => [...prev, ...newKeys]);
		}
	}, [chapterKeys, chapterOrder]);

	const addChapter = useCallback(() => {
		const nextIndex = existingCount;
		const nextKey = `nC-chapitre${nextIndex}`;
		setValues((prev) => ({ ...prev, [nextKey]: "" }));
		// Changer directement vers le nouveau chapitre
		setCurrentChapterKey(nextKey);
	}, [existingCount, setValues]);

	const removeChapter = useCallback((keyToRemove) => {
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
	}, [existingCount, currentChapterKey, chapterOrder, setValues]);

	const handleChapterChange = useCallback((e) => {
		const selectedKey = e.target.value;
		setCurrentChapterKey(selectedKey);
	}, []);

	// Fonction pour nettoyer le titre (enlever nC-) - mémorisée
	const getCleanTitle = useCallback((key) => {
		return key.replace(/^nC-/, "");
	}, []);

	// Fonction pour gérer le changement de nom du chapitre (mise à jour en temps réel)
	const handleChapterNameChange = useCallback((oldKey, newName) => {
		// Mettre à jour le nom en cours d'édition
		setEditingNames(prev => ({
			...prev,
			[oldKey]: newName
		}));
	}, []);

	// Fonction pour vérifier si le focus est encore dans la zone du chapitre
	const handleChapterBlur = useCallback((oldKey) => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			const chapterContainer = document.querySelector(`[data-chapter-key="${oldKey}"]`);
			
			// Si le focus est encore dans le conteneur du chapitre, ne rien faire
			if (chapterContainer && chapterContainer.contains(activeElement)) {
				return;
			}
			
			// Sinon, mettre à jour le titre ET le texte du chapitre
			const newName = editingNames[oldKey];
			
			// Si le nom est vide, ne rien faire - garder l'ancien nom dans la liste
			if (!newName || newName.trim() === "") {
				return;
			}
			
			const newKey = `nC-${newName}`; // Garder les espaces et caractères tels quels
			
			// Éviter de créer une clé identique
			if (newKey === oldKey) return;
			
			// Mettre à jour values avec la nouvelle clé
			setValues((prev) => {
				const newValues = {};
				
				// Préserver l'ordre exact en recréant l'objet dans le bon ordre
				chapterOrder.forEach(key => {
					if (key === oldKey) {
						// Remplacer l'ancienne clé par la nouvelle
						newValues[newKey] = prev[oldKey];
					} else {
						// Garder les autres clés telles quelles
						newValues[key] = prev[key];
					}
				});
				
				return newValues;
			});
			
			// Mettre à jour l'ordre des chapitres en préservant l'ordre exact
			setChapterOrder(prev => {
				const newOrder = [...prev];
				const index = newOrder.indexOf(oldKey);
				if (index !== -1) {
					newOrder[index] = newKey;
				}
				return newOrder;
			});
			
			// Mettre à jour la clé courante si c'était le chapitre affiché
			if (oldKey === currentChapterKey) {
				setCurrentChapterKey(newKey);
			}
		}, 0);
	}, [editingNames, getCleanTitle, chapterOrder, currentChapterKey, setValues]);

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
			{chapterOrder.map((key) => {
				const isVisible = key === currentChapterKey;
				// Utiliser editingNames[key] s'il existe, sinon getCleanTitle(key)
				const displayName = editingNames[key] !== undefined ? editingNames[key] : getCleanTitle(key);
				
				return (
					<div key={`chapter-${key}`} data-chapter-key={key}>
						<ChapterEditor
							chapterKey={key}
							isVisible={isVisible}
							displayName={displayName}
							onNameChange={handleChapterNameChange}
							onNameBlur={handleChapterBlur}
							onRemove={removeChapter}
							existingCount={existingCount}
							values={values}
							handleChange={handleChange}
							forceUpdateRef={forceUpdateRef}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default Chapter;
