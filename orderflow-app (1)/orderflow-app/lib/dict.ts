const fr = {
  app: 'OrderFlow', orders: 'Commandes', users: 'Utilisateurs', logout: 'Se déconnecter', login: 'Se connecter', signup: 'Créer un compte',
  email: 'E-mail', password: 'Mot de passe', fullName: 'Nom complet', noAccount: 'Pas de compte ? Créer un compte', haveAccount: 'Déjà un compte ? Se connecter',
  created: 'Compte créé. Il sera actif après validation par un administrateur.', checkMail: 'Vérifiez votre e-mail pour confirmer le compte.',
  pendingTitle: 'Activation en attente', pendingText: 'Votre compte doit être activé par un administrateur. Cette page se met à jour dès que c’est fait.',
  newOrder: 'Nouvelle commande', customer: 'Client', phone: 'Téléphone', wilaya: 'Wilaya', product: 'Produit', qty: 'Qté', priority: 'Priorité',
  normal: 'Normal', urgent: 'Urgent', due: 'Livraison prévue', stage: 'Étape', allStages: 'Toutes les étapes', search: 'Rechercher…',
  save: 'Enregistrer la commande', advance: 'Étape suivante', deliver: 'Confirmer la livraison', delivered: 'Livrée', remove: 'Supprimer',
  confirmDelete: 'Supprimer définitivement cette commande ?', empty: 'Aucune commande. Créez la première avec « Nouvelle commande ».',
  active: 'Actif', inactive: 'Inactif', activate: 'Activer', deactivate: 'Désactiver', role: 'Rôle', department: 'Département',
  roleAdmin: 'Administrateur', roleStaff: 'Collaborateur', noDept: '— Aucun —', pendingUsers: 'En attente d’activation', you: '(vous)',
  offlineTitle: 'Hors connexion', offlineText: 'Reconnectez-vous à Internet pour continuer.', install: 'Installer l’application',
  d_sales: 'Commercial', d_factory: 'Usine', d_warehouse: 'Stockage', d_accountant: 'Comptabilité', d_logistics: 'Distribution',
  s0: 'Commande client', s1: 'Commercial', s2: 'Production', s3: 'Stockage', s4: 'Comptabilité', s5: 'Distribution',
};
export type Dict = Record<keyof typeof fr, string>;
const ar: Dict = {
  app: 'أوردر فلو', orders: 'الطلبيات', users: 'المستخدمون', logout: 'تسجيل الخروج', login: 'تسجيل الدخول', signup: 'إنشاء حساب',
  email: 'البريد الإلكتروني', password: 'كلمة المرور', fullName: 'الاسم الكامل', noAccount: 'ليس لديك حساب؟ أنشئ حساباً', haveAccount: 'لديك حساب؟ سجّل الدخول',
  created: 'تم إنشاء الحساب. سيُفعَّل بعد موافقة المدير.', checkMail: 'تحقق من بريدك الإلكتروني لتأكيد الحساب.',
  pendingTitle: 'في انتظار التفعيل', pendingText: 'يجب أن يفعّل المدير حسابك. تتحدث هذه الصفحة تلقائياً بمجرد التفعيل.',
  newOrder: 'طلبية جديدة', customer: 'الزبون', phone: 'الهاتف', wilaya: 'الولاية', product: 'المنتج', qty: 'الكمية', priority: 'الأولوية',
  normal: 'عادي', urgent: 'مستعجل', due: 'تاريخ التسليم', stage: 'المرحلة', allStages: 'كل المراحل', search: 'بحث…',
  save: 'تسجيل الطلبية', advance: 'المرحلة التالية', deliver: 'تأكيد التسليم', delivered: 'تم التسليم', remove: 'حذف',
  confirmDelete: 'هل تريد حذف هذه الطلبية نهائياً؟', empty: 'لا توجد طلبيات. أنشئ أول طلبية بزر «طلبية جديدة».',
  active: 'مفعّل', inactive: 'معطّل', activate: 'تفعيل', deactivate: 'تعطيل', role: 'الدور', department: 'القسم',
  roleAdmin: 'مدير', roleStaff: 'موظف', noDept: '— بدون —', pendingUsers: 'في انتظار التفعيل', you: '(أنت)',
  offlineTitle: 'لا يوجد اتصال', offlineText: 'أعد الاتصال بالإنترنت للمتابعة.', install: 'تثبيت التطبيق',
  d_sales: 'التجاري', d_factory: 'المصنع', d_warehouse: 'التخزين', d_accountant: 'المحاسبة', d_logistics: 'التوزيع',
  s0: 'طلب الزبون', s1: 'الممثل التجاري', s2: 'المصنع', s3: 'التخزين', s4: 'التسجيل المحاسبي', s5: 'التوزيع',
};
export const dict: Record<'fr' | 'ar', Dict> = { fr, ar };
export type Locale = 'fr' | 'ar';
export const stageName = (d: Dict, n: number) => d[`s${n}` as keyof Dict];
