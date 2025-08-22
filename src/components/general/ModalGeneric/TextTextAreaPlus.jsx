import React from "react";
import { ToolbarTipTap } from "@components";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";

const TextAreaEditor = React.memo(({ content, onChange, forceUpdateRef }) => {
	const editor = useEditor({
		extensions: [StarterKit],
		content: content || "",
		onUpdate: ({ editor }) => {
			onChange({ target: { value: editor.getHTML() } });
		},
	});

	// Mettre à jour le contenu de l'éditeur quand content change
	React.useEffect(() => {
		if (editor && editor.getHTML() !== content) {
			editor.commands.setContent(content || '');
		}
	}, [content, editor, forceUpdateRef.current]);

	return (
		<>
			<ToolbarTipTap editor={editor} />
			<EditorContent editor={editor} className="tiptap-editor" />
		</>
	);
});

const TextTextAreaPlus = ({ config, values, setValues, handleChange, forceUpdateRef }) => {
	const { t } = useTranslation("modal");
	// Détecter combien de paires existent déjà
	const textKeyBase = "inputText";
	const textareaKeyBase = "inputTextarea";
	const textRegex = /^inputText(\d+)$/;
	const textareaRegex = /^inputTextarea(\d+)$/;

	const textIndexes = Object.keys(values)
		.filter((k) => textRegex.test(k))
		.map((k) => Number(k.replace(textKeyBase, "")))
		.filter((n) => !Number.isNaN(n));
	const textareaIndexes = Object.keys(values)
		.filter((k) => textareaRegex.test(k))
		.map((k) => Number(k.replace(textareaKeyBase, "")))
		.filter((n) => !Number.isNaN(n));

	const existingCount = Math.max(
		textIndexes.length ? Math.max(...textIndexes) + 1 : 0,
		textareaIndexes.length ? Math.max(...textareaIndexes) + 1 : 0,
		1
	);

	const rows = Array.from({ length: existingCount }, (_, idx) => idx);

	const addRow = () => {
		// Ajoute une nouvelle paire vide
		const nextIndex = existingCount; // basé sur le comptage actuel
		const nextTextKey = `${textKeyBase}${nextIndex}`;
		const nextTextareaKey = `${textareaKeyBase}${nextIndex}`;
		setValues((prev) => ({ ...prev, [nextTextKey]: "", [nextTextareaKey]: "" }));
	};

	const removeRow = (indexToRemove) => {
		if (existingCount <= 1) return; // Garder au moins une ligne
		
		const textKey = `${textKeyBase}${indexToRemove}`;
		const textareaKey = `${textareaKeyBase}${indexToRemove}`;
		
		setValues((prev) => {
			const newValues = { ...prev };
			delete newValues[textKey];
			delete newValues[textareaKey];
			
			// Réorganiser les index pour éviter les trous
			const remainingTextKeys = Object.keys(newValues)
				.filter(k => textRegex.test(k))
				.sort((a, b) => {
					const aIndex = Number(a.replace(textKeyBase, ""));
					const bIndex = Number(b.replace(textKeyBase, ""));
					return aIndex - bIndex;
				});
			
			const remainingTextareaKeys = Object.keys(newValues)
				.filter(k => textareaRegex.test(k))
				.sort((a, b) => {
					const aIndex = Number(a.replace(textareaKeyBase, ""));
					const bIndex = Number(b.replace(textareaKeyBase, ""));
					return aIndex - bIndex;
				});
			
			// Recréer les clés avec des index séquentiels
			const reorganizedValues = {};
			Object.keys(newValues).forEach(key => {
				if (!textRegex.test(key) && !textareaRegex.test(key)) {
					reorganizedValues[key] = newValues[key];
				}
			});
			
			remainingTextKeys.forEach((oldKey, newIndex) => {
				const newKey = `${textKeyBase}${newIndex}`;
				reorganizedValues[newKey] = newValues[oldKey];
			});
			
			remainingTextareaKeys.forEach((oldKey, newIndex) => {
				const newKey = `${textareaKeyBase}${newIndex}`;
				reorganizedValues[newKey] = newValues[oldKey];
			});
			
			return reorganizedValues;
		});
	};

	const label = config?.label ?? "Texte + TextArea";
	return (
		<div className="cf-field">
			<label className="tm-label label-fiche">{t(label)}</label>
			{rows.map((idx) => {
				const textKey = `${textKeyBase}${idx}`;
				const textareaKey = `${textareaKeyBase}${idx}`;
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
						<div className="parentdodo" style={{ flexDirection: "column", gap: "12px" }}>
							<div className="dada" >
								<label className="tm-label label-fiche" htmlFor={textKey}>{t("titre")} :</label>
								<input id={textKey} className="ficheText textparent" type="text" value={values[textKey] ?? ""} onChange={handleChange(textKey)} />
							</div>
							
							<div className="cf-field short" style={{ flex: 1 }}>
								<label className="tm-label label-about" htmlFor={textareaKey}>{t("description")} :</label>
								<div className="cf-generic">
									<TextAreaEditor 
										content={values[textareaKey] || ""}
										onChange={handleChange(textareaKey)}
										forceUpdateRef={forceUpdateRef}
									/>
								</div>
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

export default TextTextAreaPlus;
