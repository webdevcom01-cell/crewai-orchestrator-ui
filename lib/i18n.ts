import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        agents: 'Agents',
        tasks: 'Tasks',
        templates: 'Templates',
        run: 'Run Simulation',
        history: 'History',
        collaboration: 'Collaboration',
        audit: 'Audit Log',
        notifications: 'Notifications',
        export: 'Export Code',
        settings: 'Settings',
      },
      
      // Common actions
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        add: 'Add',
        remove: 'Remove',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh',
        copy: 'Copy',
        paste: 'Paste',
        undo: 'Undo',
        redo: 'Redo',
        confirm: 'Confirm',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        clear: 'Clear',
        apply: 'Apply',
        view: 'View',
        download: 'Download',
        upload: 'Upload',
      },
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back',
        overview: 'Overview',
        quickActions: 'Quick Actions',
        recentActivity: 'Recent Activity',
        systemStatus: 'System Status',
        stats: {
          totalAgents: 'Total Agents',
          totalTasks: 'Total Tasks',
          executionsToday: 'Executions Today',
          successRate: 'Success Rate',
        },
      },
      
      // Agents
      agents: {
        title: 'Agents',
        subtitle: 'Manage your AI agents',
        createAgent: 'Create Agent',
        editAgent: 'Edit Agent',
        deleteAgent: 'Delete Agent',
        noAgents: 'No agents yet',
        addFirst: 'Create your first agent to get started',
        fields: {
          name: 'Name',
          role: 'Role',
          goal: 'Goal',
          backstory: 'Backstory',
          model: 'Model',
          tools: 'Tools',
          allowDelegation: 'Allow Delegation',
          verbose: 'Verbose Mode',
        },
        placeholders: {
          name: 'Enter agent name',
          role: 'e.g., Senior Researcher',
          goal: 'What is the agent\'s primary goal?',
          backstory: 'Describe the agent\'s background and expertise',
        },
      },
      
      // Tasks
      tasks: {
        title: 'Tasks',
        subtitle: 'Define tasks for your agents',
        createTask: 'Create Task',
        editTask: 'Edit Task',
        deleteTask: 'Delete Task',
        noTasks: 'No tasks yet',
        addFirst: 'Create your first task',
        fields: {
          name: 'Name',
          description: 'Description',
          expectedOutput: 'Expected Output',
          agent: 'Assigned Agent',
          context: 'Context Tasks',
          isEntrypoint: 'Is Entry Point',
        },
        placeholders: {
          name: 'Enter task name',
          description: 'Describe what this task should accomplish',
          expectedOutput: 'What output format is expected?',
        },
      },
      
      // Flows
      flows: {
        title: 'Flows',
        createFlow: 'Create Flow',
        editFlow: 'Edit Flow',
        runFlow: 'Run Flow',
        stopFlow: 'Stop Flow',
        noFlows: 'No flows configured',
        fields: {
          name: 'Flow Name',
          description: 'Description',
          process: 'Process Type',
          sequential: 'Sequential',
          hierarchical: 'Hierarchical',
        },
      },
      
      // Templates
      templates: {
        title: 'Templates Library',
        subtitle: 'Pre-built workflow templates',
        search: 'Search templates...',
        categories: {
          all: 'All',
          research: 'Research',
          development: 'Development',
          marketing: 'Marketing',
          sales: 'Sales',
          support: 'Support',
          dataAnalysis: 'Data Analysis',
        },
        useTemplate: 'Use Template',
        preview: 'Preview',
      },
      
      // Collaboration
      collaboration: {
        title: 'Collaboration',
        subtitle: 'Manage your team',
        teamMembers: 'Team Members',
        inviteMember: 'Invite Member',
        roles: {
          owner: 'Owner',
          admin: 'Admin',
          editor: 'Editor',
          viewer: 'Viewer',
        },
        permissions: 'Permissions',
        chat: 'Team Chat',
      },
      
      // Audit Log
      audit: {
        title: 'Audit Log',
        subtitle: 'Track all system activities',
        filters: 'Filters',
        exportLog: 'Export Log',
        noActivity: 'No activity recorded',
        actions: {
          created: 'Created',
          updated: 'Updated',
          deleted: 'Deleted',
          executed: 'Executed',
          invited: 'Invited',
        },
      },
      
      // Notifications
      notifications: {
        title: 'Notifications',
        markAllRead: 'Mark All Read',
        clearAll: 'Clear All',
        noNotifications: 'No notifications',
        settings: 'Notification Settings',
        types: {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Info',
        },
      },
      
      // Settings
      settings: {
        title: 'Settings',
        general: 'General',
        appearance: 'Appearance',
        language: 'Language',
        notifications: 'Notifications',
        security: 'Security',
        billing: 'Billing',
        api: 'API Keys',
        theme: {
          title: 'Theme',
          dark: 'Dark',
          light: 'Light',
          system: 'System',
        },
      },
      
      // Errors
      errors: {
        generic: 'Something went wrong',
        network: 'Network error. Please check your connection.',
        notFound: 'Not found',
        unauthorized: 'Unauthorized access',
        validation: 'Please check your input',
        serverError: 'Server error. Please try again later.',
      },
      
      // Success messages
      success: {
        saved: 'Saved successfully',
        deleted: 'Deleted successfully',
        created: 'Created successfully',
        updated: 'Updated successfully',
        copied: 'Copied to clipboard',
      },
      
      // Confirmations
      confirm: {
        delete: 'Are you sure you want to delete this?',
        discard: 'Discard unsaved changes?',
        logout: 'Are you sure you want to log out?',
      },
      
      // Time
      time: {
        justNow: 'Just now',
        minutesAgo: '{{count}} minute ago',
        minutesAgo_plural: '{{count}} minutes ago',
        hoursAgo: '{{count}} hour ago',
        hoursAgo_plural: '{{count}} hours ago',
        daysAgo: '{{count}} day ago',
        daysAgo_plural: '{{count}} days ago',
        today: 'Today',
        yesterday: 'Yesterday',
      },
      
      // PWA
      pwa: {
        installTitle: 'Install CrewAI',
        installDescription: 'Install the app for faster access and offline capabilities.',
        install: 'Install',
        notNow: 'Not now',
        updateAvailable: 'Update Available',
        updateDescription: 'A new version is available. Refresh to update.',
        updateNow: 'Update Now',
        offlineReady: 'App ready for offline use',
        offline: 'You\'re offline. Some features may be limited.',
        backOnline: 'Back online',
      },
    },
  },
  
  sr: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Kontrolna tabla',
        agents: 'Agenti',
        tasks: 'Zadaci',
        templates: 'Šabloni',
        run: 'Pokreni simulaciju',
        history: 'Istorija',
        collaboration: 'Saradnja',
        audit: 'Evidencija',
        notifications: 'Obaveštenja',
        export: 'Izvezi kod',
        settings: 'Podešavanja',
      },
      
      // Common actions
      actions: {
        save: 'Sačuvaj',
        cancel: 'Otkaži',
        delete: 'Obriši',
        edit: 'Izmeni',
        create: 'Kreiraj',
        add: 'Dodaj',
        remove: 'Ukloni',
        search: 'Pretraži',
        filter: 'Filtriraj',
        export: 'Izvezi',
        import: 'Uvezi',
        refresh: 'Osveži',
        copy: 'Kopiraj',
        paste: 'Nalepi',
        undo: 'Poništi',
        redo: 'Ponovi',
        confirm: 'Potvrdi',
        close: 'Zatvori',
        back: 'Nazad',
        next: 'Dalje',
        previous: 'Prethodno',
        submit: 'Pošalji',
        reset: 'Resetuj',
        clear: 'Očisti',
        apply: 'Primeni',
        view: 'Pogledaj',
        download: 'Preuzmi',
        upload: 'Otpremi',
      },
      
      // Dashboard
      dashboard: {
        title: 'Kontrolna tabla',
        welcome: 'Dobrodošli nazad',
        overview: 'Pregled',
        quickActions: 'Brze akcije',
        recentActivity: 'Nedavne aktivnosti',
        systemStatus: 'Status sistema',
        stats: {
          totalAgents: 'Ukupno agenata',
          totalTasks: 'Ukupno zadataka',
          executionsToday: 'Izvršavanja danas',
          successRate: 'Stopa uspeha',
        },
      },
      
      // Agents
      agents: {
        title: 'Agenti',
        subtitle: 'Upravljajte AI agentima',
        createAgent: 'Kreiraj agenta',
        editAgent: 'Izmeni agenta',
        deleteAgent: 'Obriši agenta',
        noAgents: 'Još nema agenata',
        addFirst: 'Kreirajte prvog agenta za početak',
        fields: {
          name: 'Ime',
          role: 'Uloga',
          goal: 'Cilj',
          backstory: 'Pozadina',
          model: 'Model',
          tools: 'Alati',
          allowDelegation: 'Dozvoli delegiranje',
          verbose: 'Detaljan režim',
        },
        placeholders: {
          name: 'Unesite ime agenta',
          role: 'npr. Viši istraživač',
          goal: 'Koji je primarni cilj agenta?',
          backstory: 'Opišite pozadinu i ekspertizu agenta',
        },
      },
      
      // Tasks
      tasks: {
        title: 'Zadaci',
        subtitle: 'Definišite zadatke za agente',
        createTask: 'Kreiraj zadatak',
        editTask: 'Izmeni zadatak',
        deleteTask: 'Obriši zadatak',
        noTasks: 'Još nema zadataka',
        addFirst: 'Kreirajte prvi zadatak',
        fields: {
          name: 'Naziv',
          description: 'Opis',
          expectedOutput: 'Očekivani izlaz',
          agent: 'Dodeljeni agent',
          context: 'Kontekstualni zadaci',
          isEntrypoint: 'Početna tačka',
        },
        placeholders: {
          name: 'Unesite naziv zadatka',
          description: 'Opišite šta ovaj zadatak treba da postigne',
          expectedOutput: 'Koji format izlaza se očekuje?',
        },
      },
      
      // Flows
      flows: {
        title: 'Tokovi',
        createFlow: 'Kreiraj tok',
        editFlow: 'Izmeni tok',
        runFlow: 'Pokreni tok',
        stopFlow: 'Zaustavi tok',
        noFlows: 'Nema konfigurisanih tokova',
        fields: {
          name: 'Naziv toka',
          description: 'Opis',
          process: 'Tip procesa',
          sequential: 'Sekvencijalni',
          hierarchical: 'Hijerarhijski',
        },
      },
      
      // Templates
      templates: {
        title: 'Biblioteka šablona',
        subtitle: 'Gotovi šabloni za workflow',
        search: 'Pretraži šablone...',
        categories: {
          all: 'Sve',
          research: 'Istraživanje',
          development: 'Razvoj',
          marketing: 'Marketing',
          sales: 'Prodaja',
          support: 'Podrška',
          dataAnalysis: 'Analiza podataka',
        },
        useTemplate: 'Koristi šablon',
        preview: 'Pregled',
      },
      
      // Collaboration
      collaboration: {
        title: 'Saradnja',
        subtitle: 'Upravljajte timom',
        teamMembers: 'Članovi tima',
        inviteMember: 'Pozovi člana',
        roles: {
          owner: 'Vlasnik',
          admin: 'Administrator',
          editor: 'Urednik',
          viewer: 'Gledalac',
        },
        permissions: 'Dozvole',
        chat: 'Timski čet',
      },
      
      // Audit Log
      audit: {
        title: 'Evidencija aktivnosti',
        subtitle: 'Pratite sve sistemske aktivnosti',
        filters: 'Filteri',
        exportLog: 'Izvezi evidenciju',
        noActivity: 'Nema zabeleženih aktivnosti',
        actions: {
          created: 'Kreirano',
          updated: 'Ažurirano',
          deleted: 'Obrisano',
          executed: 'Izvršeno',
          invited: 'Pozvano',
        },
      },
      
      // Notifications
      notifications: {
        title: 'Obaveštenja',
        markAllRead: 'Označi sve kao pročitano',
        clearAll: 'Obriši sve',
        noNotifications: 'Nema obaveštenja',
        settings: 'Podešavanja obaveštenja',
        types: {
          success: 'Uspeh',
          error: 'Greška',
          warning: 'Upozorenje',
          info: 'Informacija',
        },
      },
      
      // Settings
      settings: {
        title: 'Podešavanja',
        general: 'Opšte',
        appearance: 'Izgled',
        language: 'Jezik',
        notifications: 'Obaveštenja',
        security: 'Bezbednost',
        billing: 'Plaćanje',
        api: 'API ključevi',
        theme: {
          title: 'Tema',
          dark: 'Tamna',
          light: 'Svetla',
          system: 'Sistemska',
        },
      },
      
      // Errors
      errors: {
        generic: 'Nešto je pošlo naopako',
        network: 'Greška mreže. Proverite konekciju.',
        notFound: 'Nije pronađeno',
        unauthorized: 'Neovlašćen pristup',
        validation: 'Proverite unete podatke',
        serverError: 'Greška servera. Pokušajte ponovo.',
      },
      
      // Success messages
      success: {
        saved: 'Uspešno sačuvano',
        deleted: 'Uspešno obrisano',
        created: 'Uspešno kreirano',
        updated: 'Uspešno ažurirano',
        copied: 'Kopirano u clipboard',
      },
      
      // Confirmations
      confirm: {
        delete: 'Da li ste sigurni da želite da obrišete?',
        discard: 'Odbaciti nesačuvane promene?',
        logout: 'Da li ste sigurni da želite da se odjavite?',
      },
      
      // Time
      time: {
        justNow: 'Upravo sada',
        minutesAgo: 'Pre {{count}} minut',
        minutesAgo_plural: 'Pre {{count}} minuta',
        hoursAgo: 'Pre {{count}} sat',
        hoursAgo_plural: 'Pre {{count}} sati',
        daysAgo: 'Pre {{count}} dan',
        daysAgo_plural: 'Pre {{count}} dana',
        today: 'Danas',
        yesterday: 'Juče',
      },
      
      // PWA
      pwa: {
        installTitle: 'Instaliraj CrewAI',
        installDescription: 'Instalirajte aplikaciju za brži pristup i offline mogućnosti.',
        install: 'Instaliraj',
        notNow: 'Ne sada',
        updateAvailable: 'Dostupna je nova verzija',
        updateDescription: 'Nova verzija je dostupna. Osvežite da biste ažurirali.',
        updateNow: 'Ažuriraj sada',
        offlineReady: 'Aplikacija je spremna za offline korišćenje',
        offline: 'Niste povezani. Neke funkcije mogu biti ograničene.',
        backOnline: 'Ponovo ste online',
      },
    },
  },
  
  de: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        agents: 'Agenten',
        tasks: 'Aufgaben',
        templates: 'Vorlagen',
        run: 'Simulation starten',
        history: 'Verlauf',
        collaboration: 'Zusammenarbeit',
        audit: 'Prüfprotokoll',
        notifications: 'Benachrichtigungen',
        export: 'Code exportieren',
        settings: 'Einstellungen',
      },
      
      // Common actions
      actions: {
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        create: 'Erstellen',
        add: 'Hinzufügen',
        remove: 'Entfernen',
        search: 'Suchen',
        filter: 'Filtern',
        export: 'Exportieren',
        import: 'Importieren',
        refresh: 'Aktualisieren',
        copy: 'Kopieren',
        paste: 'Einfügen',
        undo: 'Rückgängig',
        redo: 'Wiederholen',
        confirm: 'Bestätigen',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Vorherige',
        submit: 'Absenden',
        reset: 'Zurücksetzen',
        clear: 'Löschen',
        apply: 'Anwenden',
        view: 'Ansehen',
        download: 'Herunterladen',
        upload: 'Hochladen',
      },
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcome: 'Willkommen zurück',
        overview: 'Übersicht',
        quickActions: 'Schnellaktionen',
        recentActivity: 'Letzte Aktivitäten',
        systemStatus: 'Systemstatus',
        stats: {
          totalAgents: 'Gesamte Agenten',
          totalTasks: 'Gesamte Aufgaben',
          executionsToday: 'Ausführungen heute',
          successRate: 'Erfolgsrate',
        },
      },
      
      // Simplified German translations for brevity
      agents: {
        title: 'Agenten',
        subtitle: 'Verwalten Sie Ihre KI-Agenten',
        createAgent: 'Agent erstellen',
        editAgent: 'Agent bearbeiten',
        deleteAgent: 'Agent löschen',
        noAgents: 'Noch keine Agenten',
        addFirst: 'Erstellen Sie Ihren ersten Agenten',
        fields: {
          name: 'Name',
          role: 'Rolle',
          goal: 'Ziel',
          backstory: 'Hintergrund',
          model: 'Modell',
          tools: 'Werkzeuge',
          allowDelegation: 'Delegation erlauben',
          verbose: 'Ausführlicher Modus',
        },
        placeholders: {
          name: 'Agentennamen eingeben',
          role: 'z.B. Senior Forscher',
          goal: 'Was ist das Hauptziel des Agenten?',
          backstory: 'Beschreiben Sie den Hintergrund des Agenten',
        },
      },
      
      tasks: {
        title: 'Aufgaben',
        subtitle: 'Definieren Sie Aufgaben für Ihre Agenten',
        createTask: 'Aufgabe erstellen',
        editTask: 'Aufgabe bearbeiten',
        deleteTask: 'Aufgabe löschen',
        noTasks: 'Noch keine Aufgaben',
        addFirst: 'Erstellen Sie Ihre erste Aufgabe',
        fields: {
          name: 'Name',
          description: 'Beschreibung',
          expectedOutput: 'Erwartete Ausgabe',
          agent: 'Zugewiesener Agent',
          context: 'Kontextaufgaben',
          isEntrypoint: 'Ist Einstiegspunkt',
        },
        placeholders: {
          name: 'Aufgabenname eingeben',
          description: 'Beschreiben Sie, was diese Aufgabe erreichen soll',
          expectedOutput: 'Welches Ausgabeformat wird erwartet?',
        },
      },
      
      errors: {
        generic: 'Etwas ist schief gelaufen',
        network: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
        notFound: 'Nicht gefunden',
        unauthorized: 'Unbefugter Zugriff',
        validation: 'Bitte überprüfen Sie Ihre Eingabe',
        serverError: 'Serverfehler. Bitte versuchen Sie es später erneut.',
      },
      
      success: {
        saved: 'Erfolgreich gespeichert',
        deleted: 'Erfolgreich gelöscht',
        created: 'Erfolgreich erstellt',
        updated: 'Erfolgreich aktualisiert',
        copied: 'In die Zwischenablage kopiert',
      },
    },
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Suspense support
    react: {
      useSuspense: true,
    },
  });

export default i18n;

// Helper to change language
export const changeLanguage = (lng: string) => {
  localStorage.setItem('language', lng);
  i18n.changeLanguage(lng);
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sr', name: 'Serbian', nativeName: 'Srpski' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];
