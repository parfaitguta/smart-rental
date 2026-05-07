// context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation files
const en = {
  common: {
    app_name: "Smart Rental",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    submit: "Submit",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    yes: "Yes",
    no: "No",
    ok: "OK",
    logout: "Logout",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    phone: "Phone Number",
    full_name: "Full Name",
    role: "Role",
    status: "Status",
    date: "Date",
    amount: "Amount",
    search: "Search",
    filter: "Filter",
    update: "Update",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    size: "Size",
    available: "Available",
    rented: "Rented",
    inactive: "Inactive",
    description: "Description",
    amenities: "Amenities",
    all: "All",
    none: "None",
    select: "Select",
    choose: "Choose",
    required: "Required",
    optional: "Optional",
    from: "From",
    to: "To"
  },
  auth: {
    welcome: "Welcome",
    sign_in: "Sign in to continue",
    sign_up: "Create an account",
    forgot_password: "Forgot Password?",
    reset_password: "Reset Password",
    already_have_account: "Already have an account?",
    dont_have_account: "Don't have an account?",
    login_success: "Logged in successfully!",
    login_failed: "Invalid credentials",
    register_success: "Account created successfully!",
    logout_confirm: "Are you sure you want to logout?"
  },
  success: {
    receipt_saved: "Receipt saved",
    lease_saved: "Lease saved"
  },
  home: {
    title: "Home",
    welcome: "Welcome,",
    search_properties: "Search Properties",
    my_rentals: "My Rentals",
    my_invoices: "My Invoices",
    messages: "Messages",
    my_profile: "My Profile",
    find_your_home: "Find your next home",
    featured_properties: "Featured Properties",
    no_properties: "No properties available",
    price_per_month: "/month"
  },
  search: {
    title: "Search Properties",
    placeholder: "Search by title or location...",
    results_count: "properties found",
    no_properties: "No properties found",
    try_adjusting: "Try adjusting your search",
    location: "📍",
    beds: "🛏️ beds",
    baths: "🛁 baths",
    size: "📐 m²"
  },
  rentals: {
    title: "My Rentals",
    agreements_count: "rental agreement(s)",
    no_rentals: "No active rentals yet",
    message_landlord: "💬 Message Landlord",
    lease: "📄 Lease",
    monthly_payment: "📊 Monthly Payment",
    payment_requests: "⚠️ Payment Requests from Landlord",
    payment_history: "💰 Payment History",
    no_payments: "No payments recorded yet",
    receipt: "📄 Receipt",
    due: "Due:",
    landlord: "👤 Landlord:",
    ongoing: "Ongoing",
    to: "→"
  },
  profile: {
    title: "My Profile",
    account_info: "Account Information",
    change_password: "Change Password",
    language: "Language",
    select_language: "Select Language",
    english: "English",
    kinyarwanda: "Kinyarwanda",
    french: "French",
    notifications: "Notifications",
    dark_mode: "Dark Mode",
    about: "About",
    version: "Version",
    account_updated: "Account updated successfully"
  },
  messages: {
    title: "Messages",
    no_conversations: "No conversations yet",
    no_messages_yet: "No messages yet",
    start_chat_hint: 'Tap "Message Landlord" from your rentals to start a conversation',
    back: "Back",
    send: "Send",
    enter_message: "Type a message..."
  },
  property: {
    directions: "Get Directions",
    request_rental: "Request Rental",
    call_landlord: "Call Landlord",
    message_landlord: "Message Landlord",
    manage_rental: "Manage Rental",
    edit_property: "Edit Property",
    property_updated: "Property updated successfully",
    map_open_error: "Could not open maps. Please try again.",
    fill_required_fields: "Please fill all required fields",
    update_success: "Property updated successfully",
    update_error: "Failed to update property",
    request_sent: "Rental request sent! The landlord will contact you soon.",
    request_failed: "Failed to send request. Please try again.",
    request_error: "Failed to send request. Please try again.",
    landlord_phone_not_available: "Landlord phone number not available",
    landlord_phone_unavailable: "Landlord phone number not available",
    unable_message_landlord: "Unable to message landlord",
    message_error: "Unable to message landlord",
    property_owner: "Property Owner",
    landlord: "Landlord",
    you: "You",
    placeholder_title: "Property Title *",
    placeholder_description: "Description",
    placeholder_rent: "Monthly Rent (RWF) *",
    placeholder_province: "Province *",
    placeholder_district: "District *",
    placeholder_sector: "Sector",
    placeholder_address: "Address",
    placeholder_latitude: "Latitude (e.g., -1.9441)",
    placeholder_longitude: "Longitude (e.g., 30.0619)"
  },
  monthly_payment: {
    no_rental_info: "No rental information found",
    failed_load: "Failed to load payment data",
    select_month: "Select Month",
    already_paid: "This month is already paid",
    no_amount_remaining: "No amount remaining to pay",
    invalid_phone: "Please enter a valid phone number",
    invalid_rwanda_phone: "Please enter a valid Rwanda phone number (e.g., 078XXXXXXX)",
    payment_pending: "Payment pending",
    payment_confirmed: "Your payment has been confirmed!",
    payment_failed: "Payment failed. Please try again.",
    payment_verified_error: "Could not verify payment status. Please check later."
  },
  reviews: {
    title: "Reviews & Ratings",
    write_review: "Write a Review",
    all_reviews: "All Reviews",
    my_reviews: "My Reviews",
    no_reviews: "No reviews yet",
    select_property: "Select Property",
    no_properties: "No rental properties found",
    review_submitted: "Review submitted successfully!",
    submit_failed: "Failed to submit review"
  },
  wishlist: {
    title: "Saved Properties",
    saved_count: "saved",
    no_saved: "❤️ No saved properties",
    no_saved_desc: "Save properties you love to see them here",
    remove_confirm: "Remove this property from wishlist?",
    removed: "Property removed from wishlist",
    remove_failed: "Failed to remove"
  },
  errors: {
    network: "Network error. Please check your connection.",
    server: "Server error. Please try again later.",
    unauthorized: "Unauthorized. Please login again.",
    not_found: "Not found",
    validation: "Please check your input",
    something_wrong: "Something went wrong",
    download_failed: "Failed to download",
    receipt_download_failed: "Failed to download receipt",
    lease_download_failed: "Failed to download lease agreement. Please try again.",
    landlord_id_missing: "Unable to message landlord: Landlord ID not found"
  }
};

const kinyarwanda = {
  common: {
    app_name: "Smart Rental",
    loading: "Irategekirwa...",
    save: "Bika",
    cancel: "Guhagarika",
    delete: "Siba",
    edit: "Hindura",
    back: "Subira inyuma",
    next: "Urukurikirane",
    submit: "Ohereza",
    confirm: "Emeza",
    success: "Byakunze",
    error: "Ikosa",
    warning: "Iburira",
    info: "Amakuru",
    yes: "Yego",
    no: "Oya",
    ok: "Sawa",
    logout: "Sohoka",
    login: "Injira",
    register: "Iyandikishe",
    email: "Imeli",
    password: "Ijambo ryibanga",
    phone: "Nimero ya terefone",
    full_name: "Izina ryuzuye",
    role: "Uruhare",
    status: "Ihame",
    date: "Itariki",
    amount: "Amafaranga",
    search: "Shakisha",
    filter: "Tandukanya",
    update: "Hindura",
    bedrooms: "Ibitanda",
    bathrooms: "Ubwiherero",
    size: "Ingano",
    available: "Biboneka",
    rented: "Yakodeshejwe",
    inactive: "Ntaboneka",
    description: "Ibisobanuro",
    amenities: "Ibikoresho",
    all: "Byose",
    none: "Nta",
    select: "Hitamo",
    choose: "Hitamo",
    required: "Birakenewe",
    optional: "Bishoboka",
    from: "Kuva",
    to: "Kugeza"
  },
  auth: {
    welcome: "Murakaza neza",
    sign_in: "Injira kugira ukomere",
    sign_up: "Kora konti",
    forgot_password: "Wibagiwe ijambo ryibanga?",
    reset_password: "Hindura ijambo ryibanga",
    already_have_account: "Ufite konti?",
    dont_have_account: "Nta konti ufite?",
    login_success: "Winjiye neza!",
    login_failed: "Amakuru atariyo",
    register_success: "Konti yawe yakozwe neza!",
    logout_confirm: "Uri bwizeye ko ushaka kusohoka?"
  },
  success: {
    receipt_saved: "Inyemezabwishyu yabitswe",
    lease_saved: "Amasezerano yabitswe"
  },
  home: {
    title: "Ahabanza",
    welcome: "Murakaza neza,",
    search_properties: "Shakisha Amazu",
    my_rentals: "Amazu Nakodesheje",
    my_invoices: "Fagitire zanjye",
    messages: "Ubutumwa",
    my_profile: "Indangamuntu",
    find_your_home: "Shakisha urugo rwawe",
    featured_properties: "Amazu yibanda",
    no_properties: "Nta mazu aboneka",
    price_per_month: "/ukwezi"
  },
  search: {
    title: "Shakisha Amazu",
    placeholder: "Shakisha ku izina cyangwa ahantu...",
    results_count: "amazu yabonetse",
    no_properties: "Nta mazu yabonetse",
    try_adjusting: "Gerageza guhindura ubushakashatsi",
    location: "📍",
    beds: "🛏️ ibitanda",
    baths: "🛁 ibikoresho",
    size: "📐 m²"
  },
  rentals: {
    title: "Amazu Nakodesheje",
    agreements_count: "amasezerano y'ubukode (s)",
    no_rentals: "Nta mazu wakodesheje",
    message_landlord: "💬 Andikira Nyir'amazu",
    lease: "📄 Amasezerano",
    monthly_payment: "📊 Kwishyura Buri Kwezi",
    payment_requests: "⚠️ Ubusabe bwo Kwishyura",
    payment_history: "💰 Amateka y'Ibishyurwa",
    no_payments: "Nta byishyuriwe",
    receipt: "📄 Inyemezabwishyu",
    due: "Gukwiye:",
    landlord: "👤 Nyir'amazu:",
    ongoing: "Bikomeje",
    to: "→"
  },
  profile: {
    title: "Indangamuntu",
    account_info: "Amakuru ya konti",
    change_password: "Hindura ijambo ryibanga",
    language: "Ururimi",
    select_language: "Hitamo ururimi",
    english: "Icyongereza",
    kinyarwanda: "Ikinyarwanda",
    french: "Igifaransa",
    notifications: "Imenyesha",
    dark_mode: "Ijimye",
    about: "Ibijyanye na",
    version: "Verisiyo",
    account_updated: "Konti yavuguruwe neza"
  },
  messages: {
    title: "Ubutumwa",
    no_conversations: "Nta biganiro kugeza ubu",
    no_messages_yet: "Nta butumwa kugeza ubu",
    start_chat_hint: 'Kanda "Andikira Nyir\'amazu" mu mazu yawe kugirango utangire ikiganiro',
    back: "Subira inyuma",
    send: "Ohereza",
    enter_message: "Andika ubutumwa..."
  },
  property: {
    directions: "Fata inzira",
    request_rental: "Saba Ubukode",
    call_landlord: "Hamamagara Nyiri Inzu",
    message_landlord: "Andikira Nyir'amazu",
    manage_rental: "Genzura Ubukode",
    edit_property: "Hindura Inzu",
    property_updated: "Inzu yavuguruwe neza",
    map_open_error: "Ntibishobotse gufungura amapfa. Gerageza kongera.",
    fill_required_fields: "Wuzuze ibyibanze byose",
    update_success: "Inzu yavuguruwe neza",
    update_error: "Ntibashoboye kuvugurura inzu",
    request_sent: "Ubusabe bw'ubukode bwoherejwe! Nyiri inzu azakumenyesha vuba.",
    request_failed: "Ntibashoboye kohereza ubusabe. Gerageza kongera.",
    request_error: "Ntibashoboye kohereza ubusabe. Gerageza kongera.",
    landlord_phone_not_available: "Nimero ya nyir'inzu ntiboneka",
    landlord_phone_unavailable: "Nimero ya nyir'inzu ntiboneka",
    unable_message_landlord: "Ntibishobotse kwandikira nyir'amazu",
    message_error: "Ntibishobotse kwandikira nyir'amazu",
    property_owner: "Nyiri Inzu",
    landlord: "Nyir'amazu",
    you: "Wowe",
    placeholder_title: "Umutwe w'inkuru *",
    placeholder_description: "Ibisobanuro",
    placeholder_rent: "Ubukode buri kwezi (RWF) *",
    placeholder_province: "Intara *",
    placeholder_district: "Akarere *",
    placeholder_sector: "Umurenge",
    placeholder_address: "Aderesi",
    placeholder_latitude: "Latitude (nka -1.9441)",
    placeholder_longitude: "Longitude (nka 30.0619)"
  },
  monthly_payment: {
    no_rental_info: "Nta makuru y'ubukode yabonetse",
    failed_load: "Ntibashoboye gukurura amakuru y'ubwishyu",
    select_month: "Hitamo Ukwezi",
    already_paid: "Uyu kwezi warishuwe",
    no_amount_remaining: "Nta mafaranga asigaye yo kwishyura",
    invalid_phone: "Andika nimero ya telefone ikwiye",
    invalid_rwanda_phone: "Andika nimero ya telefone y'u Rwanda ikwiye (nka 078XXXXXXX)",
    payment_pending: "Kwishyura biracyategerejwe",
    payment_confirmed: "Kwishyura kwawe kwemejwe!",
    payment_failed: "Kwishyura kwananiranye. Gerageza kongera.",
    payment_verified_error: "Ntibishobotse kwemeza uko kwishyura. Nyamuneka reba nyuma."
  },
  reviews: {
    title: "Ibyo abakiriya bavuga",
    write_review: "Andika Icyifuzo",
    all_reviews: "Ibyo bose bavuze",
    my_reviews: "Ibyo njye navuze",
    no_reviews: "Nta nkomoko zagaragaye",
    select_property: "Hitamo Inzu",
    no_properties: "Nta mazu wakodesheje yabonetse",
    review_submitted: "Icyifuzo cyoherejwe neza!",
    submit_failed: "Ntibashoboye kohereza icyifuzo"
  },
  wishlist: {
    title: "Amazu Uzakunda",
    saved_count: "byakunzwe",
    no_saved: "❤️ Nta mazu wakunze",
    no_saved_desc: "Bika amazu ukunda kugirango uwabona hano",
    remove_confirm: "Wemeza gusiba iyi nzu mu bakunze?",
    removed: "Inzu yasibwe mu bakunze",
    remove_failed: "Ntibashoboye gusiba"
  },
  errors: {
    network: "Ikosa ry'ubumenyamakuru. Raba urusobe rwawe.",
    server: "Ikosa rya seriveri. Gerageza nyuma.",
    unauthorized: "Ntaburenganzira. Uruhare rwaba rwarapfuye.",
    not_found: "Ntibiboneka",
    validation: "Gerageza uburyo wanditse",
    something_wrong: "Hari ikibazo",
    download_failed: "Ntibishobotse gukurura",
    receipt_download_failed: "Ntibishobotse gukurura inyemezabwishyu",
    lease_download_failed: "Ntibishobotse gukurura amasezerano. Gerageza nyuma.",
    landlord_id_missing: "Ntibishobotse kwandikira nyir'amazu: ID ya nyir'amazu ntiboneka"
  }
};

const french = {
  common: {
    app_name: "Smart Rental",
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    back: "Retour",
    next: "Suivant",
    submit: "Soumettre",
    confirm: "Confirmer",
    success: "Succès",
    error: "Erreur",
    warning: "Attention",
    info: "Information",
    yes: "Oui",
    no: "Non",
    ok: "OK",
    logout: "Déconnexion",
    login: "Connexion",
    register: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    phone: "Téléphone",
    full_name: "Nom complet",
    role: "Rôle",
    status: "Statut",
    date: "Date",
    amount: "Montant",
    search: "Rechercher",
    filter: "Filtrer",
    update: "Mettre à jour",
    bedrooms: "Chambres",
    bathrooms: "Salles de bain",
    size: "Taille",
    available: "Disponible",
    rented: "Loué",
    inactive: "Inactif",
    description: "Description",
    amenities: "Équipements",
    all: "Tous",
    none: "Aucun",
    select: "Sélectionner",
    choose: "Choisir",
    required: "Requis",
    optional: "Optionnel",
    from: "De",
    to: "À"
  },
  auth: {
    welcome: "Bienvenue",
    sign_in: "Connectez-vous pour continuer",
    sign_up: "Créer un compte",
    forgot_password: "Mot de passe oublié?",
    reset_password: "Réinitialiser",
    already_have_account: "Déjà un compte?",
    dont_have_account: "Pas encore de compte?",
    login_success: "Connecté avec succès!",
    login_failed: "Identifiants invalides",
    register_success: "Compte créé avec succès!",
    logout_confirm: "Voulez-vous vraiment vous déconnecter?"
  },
  success: {
    receipt_saved: "Reçu enregistré",
    lease_saved: "Contrat enregistré"
  },
  home: {
    title: "Accueil",
    welcome: "Bienvenue,",
    search_properties: "Rechercher",
    my_rentals: "Mes locations",
    my_invoices: "Mes factures",
    messages: "Messages",
    my_profile: "Mon profil",
    find_your_home: "Trouvez votre prochain logement",
    featured_properties: "Propriétés vedettes",
    no_properties: "Aucune propriété disponible",
    price_per_month: "/mois"
  },
  search: {
    title: "Rechercher des propriétés",
    placeholder: "Rechercher par titre ou lieu...",
    results_count: "propriétés trouvées",
    no_properties: "Aucune propriété trouvée",
    try_adjusting: "Essayez d'ajuster votre recherche",
    location: "📍",
    beds: "🛏️ lits",
    baths: "🛁 salles de bain",
    size: "📐 m²"
  },
  rentals: {
    title: "Mes locations",
    agreements_count: "contrat(s) de location",
    no_rentals: "Aucune location active",
    message_landlord: "💬 Message propriétaire",
    lease: "📄 Contrat",
    monthly_payment: "📊 Paiement mensuel",
    payment_requests: "⚠️ Demandes de paiement",
    payment_history: "💰 Historique des paiements",
    no_payments: "Aucun paiement enregistré",
    receipt: "📄 Reçu",
    due: "Échéance:",
    landlord: "👤 Propriétaire:",
    ongoing: "En cours",
    to: "→"
  },
  profile: {
    title: "Mon profil",
    account_info: "Informations",
    change_password: "Mot de passe",
    language: "Langue",
    select_language: "Choisir",
    english: "Anglais",
    kinyarwanda: "Kinyarwanda",
    french: "Français",
    notifications: "Notifications",
    dark_mode: "Mode sombre",
    about: "À propos",
    version: "Version",
    account_updated: "Compte mis à jour"
  },
  messages: {
    title: "Messages",
    no_conversations: "Aucune conversation pour le moment",
    no_messages_yet: "Aucun message pour le moment",
    start_chat_hint: 'Appuyez sur "Message propriétaire" depuis vos locations pour démarrer une conversation',
    back: "Retour",
    send: "Envoyer",
    enter_message: "Tapez un message..."
  },
  property: {
    directions: "Itinéraire",
    request_rental: "Demander la location",
    call_landlord: "Appeler le propriétaire",
    message_landlord: "Message propriétaire",
    manage_rental: "Gérer la location",
    edit_property: "Modifier la propriété",
    property_updated: "Propriété mise à jour avec succès",
    map_open_error: "Impossible d'ouvrir la carte. Veuillez réessayer.",
    fill_required_fields: "Veuillez remplir tous les champs requis",
    update_success: "Propriété mise à jour avec succès",
    update_error: "Échec de la mise à jour de la propriété",
    request_sent: "Demande de location envoyée ! Le propriétaire vous contactera bientôt.",
    request_failed: "Échec de l'envoi de la demande. Veuillez réessayer.",
    request_error: "Échec de l'envoi de la demande. Veuillez réessayer.",
    landlord_phone_not_available: "Numéro du propriétaire indisponible",
    landlord_phone_unavailable: "Numéro du propriétaire indisponible",
    unable_message_landlord: "Impossible de contacter le propriétaire",
    message_error: "Impossible de contacter le propriétaire",
    property_owner: "Propriétaire",
    landlord: "Propriétaire",
    you: "Vous",
    placeholder_title: "Titre de la propriété *",
    placeholder_description: "Description",
    placeholder_rent: "Loyer mensuel (RWF) *",
    placeholder_province: "Province *",
    placeholder_district: "District *",
    placeholder_sector: "Secteur",
    placeholder_address: "Adresse",
    placeholder_latitude: "Latitude (ex : -1,9441)",
    placeholder_longitude: "Longitude (ex : 30,0619)"
  },
  monthly_payment: {
    no_rental_info: "Aucune information de location trouvée",
    failed_load: "Échec du chargement des paiements",
    select_month: "Sélectionnez un mois",
    already_paid: "Ce mois est déjà payé",
    no_amount_remaining: "Aucun montant restant à payer",
    invalid_phone: "Veuillez entrer un numéro de téléphone valide",
    invalid_rwanda_phone: "Veuillez entrer un numéro de téléphone rwandais valide (ex : 078XXXXXXX)",
    payment_pending: "Paiement en attente",
    payment_confirmed: "Votre paiement a été confirmé !",
    payment_failed: "Le paiement a échoué. Veuillez réessayer.",
    payment_verified_error: "Impossible de vérifier le paiement. Veuillez réessayer plus tard."
  },
  reviews: {
    title: "Avis & Notes",
    write_review: "Écrire un avis",
    all_reviews: "Tous les avis",
    my_reviews: "Mes avis",
    no_reviews: "Aucun avis pour le moment",
    select_property: "Sélectionner une propriété",
    no_properties: "Aucune propriété locative trouvée",
    review_submitted: "Avis soumis avec succès !",
    submit_failed: "Échec de l'envoi de l'avis"
  },
  wishlist: {
    title: "Propriétés sauvegardées",
    saved_count: "enregistré(s)",
    no_saved: "❤️ Aucune propriété enregistrée",
    no_saved_desc: "Enregistrez vos propriétés favorites pour les voir ici",
    remove_confirm: "Retirer cette propriété de la liste de souhaits ?",
    removed: "Propriété retirée de la liste de souhaits",
    remove_failed: "Échec de la suppression"
  },
  errors: {
    network: "Erreur réseau. Vérifiez votre connexion.",
    server: "Erreur serveur. Réessayez.",
    unauthorized: "Non autorisé. Reconnectez-vous.",
    not_found: "Non trouvé",
    validation: "Vérifiez votre saisie",
    something_wrong: "Une erreur est survenue",
    download_failed: "Échec du téléchargement",
    receipt_download_failed: "Échec du téléchargement du reçu",
    lease_download_failed: "Échec du téléchargement du contrat de location. Veuillez réessayer.",
    landlord_id_missing: "Impossible de contacter le propriétaire : ID du propriétaire introuvable"
  }
};

const translations = {
  en,
  kinyarwanda,
  french
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      await AsyncStorage.setItem('app_language', newLanguage);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        let fallback = translations['en'];
        for (const fk of keys) {
          fallback = fallback?.[fk];
        }
        return fallback || key;
      }
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};