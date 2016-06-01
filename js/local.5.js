/* =================================================================================================
 * AUVERCLOUD SAFENOTE 4.0 MESSAGES
 * -------------------------------------------------------------------------------------------------
 * PLEASE NOTE: To use with arc.localizeByID (lib4.js)
 * ================================================================================================= */
var MSG = {
	meta_definition : {
		en : "Secure notes manager.",
		fr : "Gestionnaire de notes sécurisées.",
		prop : "meta-definition"
	},
	ok : {
		en : "OK",
		fr : "OK",
		prop : "class-html"
	},
	cancel : {
		en : "cancel",
		fr : "annuler",
		prop : "class-html"
	},
	print : {
		en : "print",
		fr : "imprimer",
		prop : "class-html"
	},
	confirm : {
		en : "confirm",
		fr : "confirmer",
		prop : "class-html"
	},
	setup : {
		en : "Ongoing setup.",
		fr : "Configuration en cours.",
		prop : "html"
	},
	btn_intro : {
		en : "Skip the introduction",
		fr : "Passer l'introduction",
		prop : "html"
	},
	show_intro : {
		en : " Play animation at startup.",
		fr : " Jouer l'animation au démarrage.",
		prop : "html"
	},
	intro_remauth : {
		en : "<b class='green-dark'>NEW</b> The passwordless login method uses your email address or the <b>RemAuth</b> mobile application in order to login. More details on <a href='http://remauth.com' target='_blank'>remauth.com</a>.<br><br><b>Whatever the login method, a SafeNote subscription is required.</b>",
		fr : "<b class='green-dark'>NOUVEAU</b> La connexion sans mot de passe utilise votre adresse email ou l'application mobile <b>RemAuth</b> pour vous connecter. Plus de détails sur <a href='http://remauth.com' target='_blank'>remauth.com</a>.<br><br><b>Quelque soit la méthode de connexion, une inscription à SafeNote est requise.</b>",
		prop : "html"
	},
	legend_signin : {
		en : "Sign in to your account",
		fr : "Connexion à votre compte",
		prop : "html"
	},
	label_signin_email : {
		en : "Email address",
		fr : "Adresse email",
		prop : "html"
	},
	label_signin_pwd : {
		en : "Password",
		fr : "Mot de passe",
		prop : "html"
	},
	btn_signin : {
		en : "Login",
		fr : "Connexion",
		prop : "html"
	},
	btn_signin_double : {
		en : "Standard<br>Login",
		fr : "Connexion<br>Standard",
		prop : "html"
	},
	btn_remauth : {
		en : "Passwordless<br>Login",
		fr : "Connexion<br>sans mot de passe",
		prop : "html"
	},
	label_version : {
		en : "Version ",
		fr : "Version ",
		prop : "html"
	},
	legend_signup : {
		en : "Subscription / New password",
		fr : "Inscription / Nouveau mot de passe",
		prop : "html"
	},
	label_signup_email : {
		en : "Valid email address",
		fr : "Adresse email valide",
		prop : "html"
	},
	label_signup_challenge : {
		en : "Result or <span class='icon-loop3 smaller'></span> to change the operation",
		fr : "Résultat ou <span class='icon-loop3 smaller'></span> pour changer d'opération",
		prop : "html"
	},
	pref_title : {
		en : "Preferences",
		fr : "Préférences",
		prop : "html"
	},
	faq_title : {
		en : "FAQ",
		fr : "FAQ",
		prop : "html"
	},
	btn_form_signup : {
		en : "Subscription / Forgotten password",
		fr : "Inscription / Mot de passe oublié",
		prop : "html"
	},
	btn_form_signin : {
		en : "Sign in to your account",
		fr : "Connexion à votre compte",
		prop : "html"
	},
	btn_form_remauth : {
		en : "<span class='icon-new biggest'>&nbsp;</span>Passwordless login",
		fr : "<span class='icon-new biggest'>&nbsp;</span>Connexion sans mot de passe",
		prop : "html"
	},
	btn_signup : {
		en : "Create<br>account",
		fr : "Créer<br>un compte",
		prop : "html"
	},
	btn_reset : {
		en : "Reset<br>password",
		fr : "Réinitialiser<br>mot de passe",
		prop : "html"
	},
	txt_signout : {
		en : "Sign out",
		fr : "Se déconnecter",
		prop : "html"
	},
	txt_print : {
		en : "Print all notes",
		fr : "Imprimer toutes les notes",
		prop : "html"
	},
	txt_pref : {
		en : "Preferences",
		fr : "Préférences",
		prop : "html"
	},
	txt_faq : {
		en : "FAQ",
		fr : "FAQ",
		prop : "html"
	},
	txt_designed : {
		en : "Designed by",
		fr : "Conçu par",
		prop : "html"
	},
	discover_menu : {
		en : "Click here to display the menu of additional services: sign out, printing, preferences and FAQ.",
		fr : "Cliquez ici pour faire apparaître le menu de services supplémentaires&nbsp;: déconnexion, impression, préférences et FAQ.",
		prop : "html"
	},
	discover_plus : {
		en : "Click here to create your first <q class='blue'>SafeNote</q>.<br> Then, the very first time you change a note, you will have to define the key to encrypt your notes.",
		fr : "Cliquez ici pour créer votre première <q class='blue'>SafeNote</q>.<br>Ensuite, la toute première fois que vous modifierez une note, vous devrez définir la clé qui sera utilisée pour le chiffrement de vos notes.",
		prop : "html"
	},
	label_name : {
		en : "Note name",
		fr : "Nom de la note",
		prop : "html"
	},
	label_content : {
		en : "Secured content",
		fr : "Contenu sécurisé",
		prop : "html"
	},
	legend_password : {
		en : "New password",
		fr : "Nouveau mot de passe",
		prop : "html"
	},
	label_password1 : {
		en : "8-16 digits password",
		fr : "Mot de passe de 8 à 16 chiffres",
		prop : "html"
	},
	label_password2 : {
		en : "Same as above",
		fr : "Le même que ci-dessus",
		prop : "html"
	},
	legend_unsubscribe : {
		en : "Unsubscribe",
		fr : "Désinscription",
		prop : "html"
	},
	key_new_legend : {
		en : "Define your cyphering key",
		fr : "Définissez votre clé de chiffrement",
		prop : "html"
	},
	key_new_label_1 : {
		en : "You cyphering key must be defined with <b>at least 8 alphanumeric characters</b>.<br>Pay attention to its definition! Unlike your password, <b>your cyphering key cannot be changed</b> and is frequently required.",
		fr : "Votre clé de chiffrement doit être composée <b>d'au moins 8 caractères alphanumériques</b>.<br>Définissez la avec précaution&nbsp;! Contrairement au mot de passe, <b>votre clé ne pourra pas être modifiée</b> et vous sera demandée régulièrement.",
		prop : "html"
	},
	key_new_label_2 : {
		en : "Same as above",
		fr : "Le même que ci-dessus",
		prop : "html"
	},
	key_enter_legend : {
		en : "Please enter your cyphering key",
		fr : "Saisissez votre clé de chiffrement SVP",
		prop : "html"
	},
	label_unsubscribe : {
		en : "To unsubscribe from the SafeNote service, please send an email to <b class='blue'>safenote@auvercloud.com</b> from the subscribed email address, mentioning the keyword UNSUBSCRIBE in the subject.",
		fr : "Pour vous désinscrire du service SafeNote, veuillez envoyer un email à <b class='blue'>safenote@auvercloud.com</b> à partir de votre adresse d'inscription en mentionnant le mot-clé UNSUBSCRIBE dans le sujet du message.",
		prop : "html"
	},
	tip_signin_email : {
		en : "It is required to sign up before to sign in.",
		fr : "Il est nécessaire de s'inscrire avant de se connecter.",
		prop : "title"
	},
	tip_signin_pwd : {
		en : "In case of repeated connection errors, the account is locked and then the password must be reset.<br>This field is useless in case of passwordless login.",
		fr : "En cas d'erreurs de connexions répétées, le compte se bloque et le mot de passe doit alors être réinitialisé.<br> Ce champ n'est pas utilisé en cas d'authentification sans mot de passe.",
		prop : "title"
	},
	tip_signup_email : {
		en : "This address will receive the new password on subscription or account reset.",
		fr : "C'est cette adresse qui recevra le nouveau mot de passe lors de l'inscription ou à la réinitialisation de compte.",
		prop : "title"
	},
	tip_note_name : {
		en : "No more than 80 characters.",
		fr : "Pas plus de 80 caractères.",
		prop : "title"
	},
	tip_note_content : {
		en : "No more than 4000 characters.",
		fr : "Pas plus de 4000 caractères.",
		prop : "title"
	},
	err606 : {
		en : "Forbidden value(s).",
		fr : "Valeur(s) non acceptée(s)."
	},
	err641 : {
		en : "Invalid token or operation already performed.",
		fr : "Jeton non valide ou opération déjà réalisée. ",
	},
	err643 : {
		en : "The operation result is wrong.",
		fr : "Le résultat de l'opération est faux."
	},
	err650 : {
		en : "The email address is already used.",
		fr : "L'adresse email est déjà utilisée."
	},
	err651 : {
		en : "The email address is unknowm.",
		fr : "L'adresse email inconnue."
	},
	err652 : {
		en : "Wrong password. You have %number% attempts left before locking you account.",
		fr : "Mauvais mot de passe. Il vous reste %number% tentatives avant de bloquer votre compte."
	},
	err653 : {
		en : "Your account is locked. Please reset your password.",
		fr : "Votre compte est bloqué. Veuillez réinitialiser votre mot de passe."
	},
	err662 : {
		en : "Invalid email address(es).",
		fr : "Adresse(s) email non valide(s)."
	},
	err663 : {
		en : "Empty recipient list.",
		fr : "Liste de destinataires vide."
	},
	err_pwd_invalid : {
		en : "Invalid password.",
		fr : "Mot de passe invalide."
	},
	err_pwd_match : {
		en : "The inputs do not match.",
		fr : "Les entrées ne correspondent pas."
	},
	subject_signup : {
		en : "Please confirm your subscription to SafeNote",
		fr : "Veuillez confirmer votre inscription à SafeNote"
	},
	subject_reset : {
		en : "Please confirm your password reset",
		fr : "Veuillez confirmer la réinitialisation de votre mot de passe"
	},
	notif_signup : {
		en : "Please consult the inbox of the email address ",
		fr : "Veuillez consulter la boîte de réception de l'adresse email "
	},
	callback_subscribe : {
		en : "Registration is complete for the email address ",
		fr : "Inscription validée pour l'adresse email "
	},
	callback_reset : {
		en : "Password reset is complete for the email address ",
		fr : "Le mot de passe a été réinitialisé pour l'adresse email "
	},
	default_note_name : {
		en : "New note: Click to edit!",
		fr : "Nouvelle note : Cliquez pour éditer !"
	},
	delete_cancel : {
		en : "cancel<br>delete",
		fr : "annuler<br>effacement",
	},
	delete_confirm : {
		en : "confirm<br>delete",
		fr : "confirmer<br>effacement",
	},
	key_not_valid : {
		en : "The key is not valid.",
		fr : "La clé n'est pas valide.",
	},
	key_not_match : {
		en : "The inputs do not match.",
		fr : "Les saisies ne coïncident pas.",
	},
	key_wrong : {
		en : "Wrong cyphering key.",
		fr : "Mauvaise clé de chiffrement.",
	},
	// RemAuth error
	err601 : {
		en : "Invalid email address.",
		fr : "Adresse email non valide."
	},
	err608 : {
		en : "The security token is expired. Please reload the page.",
		fr : "Le jeton de sécurité est expiré. Veuillez recharger la page."
	},
	err680 : {
		en : "The authentication ID is not valid.",
		fr : "L'identifiant d'authentification n'est pas valide."
	},
	err681 : {
		en : "The authentication has been rejected.",
		fr : "L'authentification a été rejetée."
	},
	err702 : {
		en : "Unknown RemAuth user. Please request an invitation.",
		fr : "Utilisateur RemAuth inconnu. Veuillez demander une invation."
	},
	err703 : {
		en : "Suspended account.",
		fr : "Compte suspendu."
	},
	err704 : {
		en : "Ongoing remote authentication. Please wait a few moments before restarting.",
		fr : "Authentification à distance en cours. Veuillez patienter quelques instants avant de recommencer."
	},
	// RemAuth popup invite
	invited : {
		en : "This email address is not yet known by the <b style='color:#384054'>RemAuth</b> service. A message has just been sent to <b style='color:#f80'>%email%</b> in order to enable the passwordless authentication.",
		fr : "Cette adresse email n'est pas encore connue du service <b style='color:#384054'>RemAuth</b>. Un message vient d'être envoyé à <b style='color:#f80'>%email%</b> pour activer le service d'authentifcation sans mot de passe."
	}
};
/* =================================================================================================
 * EoF
 * ================================================================================================= */