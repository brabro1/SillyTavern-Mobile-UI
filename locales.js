/**
 * Translations of Mobile UI's own labels.
 * Each entry: English text → [Spanish, Portuguese, Russian, Chinese, Japanese, Arabic].
 * To add a language, add a code to LANGS and one more column.
 */
import { addDictionary } from './i18n.js';

const LANGS = ['es', 'pt', 'ru', 'zh', 'ja', 'ar'];

const STRINGS = {
    // Tabs and pages
    'Chat': ['Chat', 'Chat', 'Чат', '聊天', 'チャット', 'الدردشة'],
    'Characters': ['Personajes', 'Personagens', 'Персонажи', '角色', 'キャラクター', 'الشخصيات'],
    'Lorebooks': ['Lorebooks', 'Lorebooks', 'Лорбуки', '世界书', 'ロアブック', 'كتب المعرفة'],
    'Presets': ['Presets', 'Predefinições', 'Пресеты', '预设', 'プリセット', 'القوالب'],
    'More': ['Más', 'Mais', 'Ещё', '更多', 'その他', 'المزيد'],
    'API': ['API', 'API', 'API', 'API', 'API', 'الواجهة'],
    'Formatting': ['Formato', 'Formatação', 'Форматирование', '格式', '書式', 'التنسيق'],
    'Settings': ['Ajustes', 'Configurações', 'Настройки', '设置', '設定', 'الإعدادات'],
    'Backgrounds': ['Fondos', 'Fundos', 'Фоны', '背景', '背景', 'الخلفيات'],
    'Extensions': ['Extensiones', 'Extensões', 'Расширения', '扩展', '拡張機能', 'الإضافات'],
    'Personas': ['Personas', 'Personas', 'Персоны', '用户角色', 'ペルソナ', 'الشخصيات الخاصة بك'],
    'AI response settings': ['Ajustes de respuesta de la IA', 'Configurações de resposta da IA', 'Настройки ответов ИИ', 'AI 回复设置', 'AI 応答の設定', 'إعدادات ردود الذكاء الاصطناعي'],
    'API connection': ['Conexión a la API', 'Conexão com a API', 'Подключение к API', 'API 连接', 'API 接続', 'الاتصال بالواجهة'],
    'Prompt formatting': ['Formato del prompt', 'Formatação do prompt', 'Форматирование промпта', '提示词格式', 'プロンプトの書式', 'تنسيق الموجّه'],
    'Lorebooks and World Info': ['Lorebooks e información del mundo', 'Lorebooks e informações do mundo', 'Лорбуки и информация о мире', '世界书与世界信息', 'ロアブックとワールド情報', 'كتب المعرفة ومعلومات العالم'],
    'User settings': ['Ajustes de usuario', 'Configurações do usuário', 'Настройки пользователя', '用户设置', 'ユーザー設定', 'إعدادات المستخدم'],
    'Chat backgrounds': ['Fondos del chat', 'Fundos do chat', 'Фоны чата', '聊天背景', 'チャット背景', 'خلفيات الدردشة'],
    'Extensions and add-ons': ['Extensiones y complementos', 'Extensões e complementos', 'Расширения и дополнения', '扩展与插件', '拡張機能とアドオン', 'الإضافات والملحقات'],
    'Who you are in the chat': ['Quién eres en el chat', 'Quem você é no chat', 'Кто вы в чате', '你在聊天中的身份', 'チャットでのあなた', 'من أنت في الدردشة'],
    'Characters and groups': ['Personajes y grupos', 'Personagens e grupos', 'Персонажи и группы', '角色和群组', 'キャラクターとグループ', 'الشخصيات والمجموعات'],

    // App bar
    'Back': ['Atrás', 'Voltar', 'Назад', '返回', '戻る', 'رجوع'],
    'Recent chats': ['Chats recientes', 'Chats recentes', 'Недавние чаты', '最近聊天', '最近のチャット', 'الدردشات الأخيرة'],
    'Chat history': ['Historial de chats', 'Histórico de chats', 'История чатов', '聊天记录', 'チャット履歴', 'سجل الدردشات'],
    'Start a new chat': ['Empezar un chat nuevo', 'Começar um novo chat', 'Начать новый чат', '开始新聊天', '新しいチャットを始める', 'بدء دردشة جديدة'],
    'New chat': ['Chat nuevo', 'Novo chat', 'Новый чат', '新聊天', '新しいチャット', 'دردشة جديدة'],
    'Connected': ['Conectado', 'Conectado', 'Подключено', '已连接', '接続済み', 'متصل'],
    'Not connected': ['Sin conexión', 'Sem conexão', 'Нет подключения', '未连接', '未接続', 'غير متصل'],
    'Group chat': ['Chat de grupo', 'Chat em grupo', 'Групповой чат', '群聊', 'グループチャット', 'دردشة جماعية'],
    'New character': ['Personaje nuevo', 'Novo personagem', 'Новый персонаж', '新角色', '新しいキャラクター', 'شخصية جديدة'],
    'Editing {name}': ['Editando a {name}', 'Editando {name}', 'Редактирование: {name}', '正在编辑 {name}', '{name} を編集中', 'تعديل {name}'],
    'Edit prompt': ['Editar prompt', 'Editar prompt', 'Изменить промпт', '编辑提示词', 'プロンプトを編集', 'تعديل الموجّه'],
    'New prompt': ['Prompt nuevo', 'Novo prompt', 'Новый промпт', '新提示词', '新しいプロンプト', 'موجّه جديد'],
    'Prompt list': ['Lista de prompts', 'Lista de prompts', 'Список промптов', '提示词列表', 'プロンプト一覧', 'قائمة الموجّهات'],
    'Prompts linked to this marker': ['Prompts vinculados a este marcador', 'Prompts ligados a este marcador', 'Промпты, связанные с этой меткой', '与此标记关联的提示词', 'このマーカーに紐づくプロンプト', 'الموجّهات المرتبطة بهذه العلامة'],
    'Quick switch': ['Cambio rápido', 'Troca rápida', 'Быстрая смена', '快速切换', 'クイック切り替え', 'تبديل سريع'],
    'Find a setting': ['Buscar un ajuste', 'Encontrar uma configuração', 'Найти настройку', '查找设置', '設定を探す', 'البحث عن إعداد'],

    // More sheet
    'Themes': ['Temas', 'Temas', 'Темы', '主题', 'テーマ', 'السمات'],
    'Phone features': ['Funciones del móvil', 'Recursos do celular', 'Функции для телефона', '手机功能', 'スマホ機能', 'ميزات الهاتف'],
    'Mobile UI settings': ['Ajustes de Mobile UI', 'Configurações do Mobile UI', 'Настройки Mobile UI', 'Mobile UI 设置', 'Mobile UI の設定', 'إعدادات Mobile UI'],
    'Install as an app': ['Instalar como app', 'Instalar como app', 'Установить как приложение', '安装为应用', 'アプリとしてインストール', 'التثبيت كتطبيق'],
    "What's new": ['Novedades', 'Novidades', 'Что нового', '新功能', '新機能', 'ما الجديد'],
    'Your theme': ['Tu tema', 'Seu tema', 'Ваша тема', '你的主题', 'あなたのテーマ', 'سمتك'],
    'Close': ['Cerrar', 'Fechar', 'Закрыть', '关闭', '閉じる', 'إغلاق'],
    'Search': ['Buscar', 'Pesquisar', 'Поиск', '搜索', '検索', 'بحث'],

    // Themes sheet
    'Changes the look on your phone. Your SillyTavern theme stays saved.': ['Cambia el aspecto en tu móvil. Tu tema de SillyTavern se conserva.', 'Muda a aparência no celular. Seu tema do SillyTavern continua salvo.', 'Меняет вид на телефоне. Ваша тема SillyTavern сохраняется.', '更改手机上的外观。你的 SillyTavern 主题会保留。', 'スマホでの見た目を変えます。SillyTavern のテーマはそのまま保存されます。', 'يغيّر المظهر على هاتفك. تبقى سمة SillyTavern محفوظة.'],
    'Look and feel': ['Aspecto', 'Aparência', 'Внешний вид', '外观', '見た目', 'المظهر'],
    'Animations': ['Animaciones', 'Animações', 'Анимации', '动画', 'アニメーション', 'الحركات'],
    'Smooth': ['Fluidas', 'Suaves', 'Плавные', '流畅', 'なめらか', 'سلسة'],
    'Light': ['Ligeras', 'Leves', 'Лёгкие', '轻量', '軽め', 'خفيفة'],
    'Off': ['No', 'Desligado', 'Выкл.', '关闭', 'オフ', 'إيقاف'],
    'Theme background': ['Fondo del tema', 'Fundo do tema', 'Фон темы', '主题背景', 'テーマの背景', 'خلفية السمة'],
    'Modern font': ['Fuente moderna', 'Fonte moderna', 'Современный шрифт', '现代字体', 'モダンフォント', 'خط حديث'],
    'New icons': ['Iconos nuevos', 'Ícones novos', 'Новые значки', '新图标', '新しいアイコン', 'أيقونات جديدة'],

    // Phone features
    'Small helpers that make SillyTavern nicer on a phone.': ['Pequeñas ayudas para usar SillyTavern mejor en el móvil.', 'Pequenas ajudas que deixam o SillyTavern melhor no celular.', 'Небольшие помощники для удобства SillyTavern на телефоне.', '让 SillyTavern 在手机上更好用的小功能。', 'スマホで SillyTavern をもっと使いやすくする小さな機能。', 'أدوات صغيرة تجعل SillyTavern أفضل على الهاتف.'],
    'Chat text size': ['Tamaño del texto', 'Tamanho do texto', 'Размер текста', '聊天文字大小', 'チャットの文字サイズ', 'حجم نص الدردشة'],
    'Helpers': ['Ayudas', 'Ajudas', 'Помощники', '辅助功能', '便利機能', 'أدوات مساعدة'],
    'Message menu': ['Menú del mensaje', 'Menu da mensagem', 'Меню сообщения', '消息菜单', 'メッセージメニュー', 'قائمة الرسالة'],
    'Long-press for message menu': ['Mantener pulsado para el menú', 'Toque longo abre o menu', 'Долгое нажатие открывает меню', '长按打开消息菜单', '長押しでメニュー', 'الضغط المطوّل لقائمة الرسالة'],
    'Connection check': ['Comprobar conexión', 'Verificar conexão', 'Проверка соединения', '连接检查', '接続チェック', 'فحص الاتصال'],
    'Faster long chats': ['Chats largos más rápidos', 'Chats longos mais rápidos', 'Быстрые длинные чаты', '长聊天更流畅', '長いチャットを高速化', 'دردشات طويلة أسرع'],
    'Jump to latest': ['Ir al último', 'Ir para a última', 'К последнему', '跳到最新', '最新へ移動', 'الانتقال إلى الأحدث'],
    'Keep unsent messages': ['Guardar mensajes sin enviar', 'Guardar mensagens não enviadas', 'Сохранять неотправленное', '保留未发送的消息', '未送信の文を保持', 'الاحتفاظ بالرسائل غير المرسلة'],
    'Keep screen on while replying': ['Pantalla encendida al responder', 'Tela ligada durante a resposta', 'Не гасить экран во время ответа', '回复时保持屏幕常亮', '返信中は画面をオンに', 'إبقاء الشاشة مضاءة أثناء الرد'],
    'Picture viewer': ['Visor de imágenes', 'Visualizador de imagens', 'Просмотр изображений', '图片查看器', '画像ビューア', 'عارض الصور'],
    'Nicer notifications': ['Avisos más bonitos', 'Notificações melhores', 'Красивые уведомления', '更好看的通知', 'きれいな通知', 'إشعارات أجمل'],
    'Send animation': ['Animación de envío', 'Animação de envio', 'Анимация отправки', '发送动画', '送信アニメーション', 'حركة الإرسال'],
    'Vibration': ['Vibración', 'Vibração', 'Вибрация', '振动', 'バイブレーション', 'الاهتزاز'],
    'Small': ['Pequeño', 'Pequeno', 'Мелкий', '小', '小', 'صغير'],
    'Normal': ['Normal', 'Normal', 'Обычный', '正常', '標準', 'عادي'],
    'Large': ['Grande', 'Grande', 'Крупный', '大', '大', 'كبير'],
    'Extra large': ['Muy grande', 'Muito grande', 'Очень крупный', '特大', '特大', 'كبير جدًا'],

    // Message menu, copy, editor
    'Copy': ['Copiar', 'Copiar', 'Копировать', '复制', 'コピー', 'نسخ'],
    'Edit': ['Editar', 'Editar', 'Изменить', '编辑', '編集', 'تعديل'],
    'Delete message': ['Borrar mensaje', 'Excluir mensagem', 'Удалить сообщение', '删除消息', 'メッセージを削除', 'حذف الرسالة'],
    'Copy text': ['Copiar texto', 'Copiar texto', 'Копировать текст', '复制文本', 'テキストをコピー', 'نسخ النص'],
    'Duplicate message': ['Duplicar mensaje', 'Duplicar mensagem', 'Дублировать сообщение', '复制一条消息', 'メッセージを複製', 'تكرار الرسالة'],
    'What would you like to do?': ['¿Qué quieres hacer?', 'O que você quer fazer?', 'Что вы хотите сделать?', '你想做什么？', '何をしますか？', 'ماذا تريد أن تفعل؟'],
    'Put the message text on the clipboard.': ['Copia el texto al portapapeles.', 'Coloca o texto na área de transferência.', 'Скопировать текст в буфер обмена.', '将消息文本复制到剪贴板。', 'メッセージの文をクリップボードにコピーします。', 'وضع نص الرسالة في الحافظة.'],
    'Add a second copy of this message to the chat, right below it.': ['Añade una copia de este mensaje justo debajo.', 'Adiciona uma cópia desta mensagem logo abaixo.', 'Добавить копию сообщения прямо под ним.', '在此消息下方添加一份副本。', 'このメッセージのコピーをすぐ下に追加します。', 'إضافة نسخة ثانية من هذه الرسالة أسفلها مباشرة.'],
    'Message copied.': ['Mensaje copiado.', 'Mensagem copiada.', 'Сообщение скопировано.', '消息已复制。', 'メッセージをコピーしました。', 'تم نسخ الرسالة.'],
    'Text copied.': ['Texto copiado.', 'Texto copiado.', 'Текст скопирован.', '文本已复制。', 'テキストをコピーしました。', 'تم نسخ النص.'],
    'Could not copy': ['No se pudo copiar', 'Não foi possível copiar', 'Не удалось скопировать', '无法复制', 'コピーできませんでした', 'تعذّر النسخ'],
    'A copy of the message was added right below it.': ['Se añadió una copia justo debajo.', 'Uma cópia foi adicionada logo abaixo.', 'Копия добавлена прямо под сообщением.', '副本已添加在下方。', 'すぐ下にコピーを追加しました。', 'أُضيفت نسخة من الرسالة أسفلها مباشرة.'],
    'Save': ['Guardar', 'Salvar', 'Сохранить', '保存', '保存', 'حفظ'],
    'Cancel': ['Cancelar', 'Cancelar', 'Отмена', '取消', 'キャンセル', 'إلغاء'],

    // Connection banner
    "Can't reach SillyTavern": ['No se puede conectar con SillyTavern', 'Não foi possível acessar o SillyTavern', 'SillyTavern недоступен', '无法连接 SillyTavern', 'SillyTavern に接続できません', 'تعذّر الوصول إلى SillyTavern'],
    'Is Termux still running? This reconnects by itself when the server is back.': ['¿Sigue abierto Termux? Se reconecta solo cuando el servidor vuelva.', 'O Termux ainda está aberto? Reconecta sozinho quando o servidor voltar.', 'Termux всё ещё работает? Подключение восстановится само, когда сервер вернётся.', 'Termux 还在运行吗？服务器恢复后会自动重新连接。', 'Termux はまだ動いていますか？サーバーが戻ると自動で再接続します。', 'هل ما زال Termux يعمل؟ سيُعاد الاتصال تلقائيًا عند عودة الخادم.'],
    'Retry': ['Reintentar', 'Tentar de novo', 'Повторить', '重试', '再試行', 'إعادة المحاولة'],
    'Back online': ['Conectado de nuevo', 'Conectado novamente', 'Снова в сети', '已重新连接', '再接続しました', 'عاد الاتصال'],

    // Quick switch
    'Change who you are, the connection, the model or the preset.': ['Cambia tu persona, la conexión, el modelo o el preset.', 'Troque sua persona, a conexão, o modelo ou a predefinição.', 'Смените персону, подключение, модель или пресет.', '切换身份、连接、模型或预设。', 'ペルソナ、接続、モデル、プリセットを切り替えます。', 'غيّر شخصيتك أو الاتصال أو النموذج أو الإعداد المسبق.'],
    'Persona': ['Persona', 'Persona', 'Персона', '用户角色', 'ペルソナ', 'الشخصية'],
    'Connection profile': ['Perfil de conexión', 'Perfil de conexão', 'Профиль подключения', '连接配置', '接続プロファイル', 'ملف الاتصال'],
    'Model': ['Modelo', 'Modelo', 'Модель', '模型', 'モデル', 'النموذج'],
    'Preset': ['Preset', 'Predefinição', 'Пресет', '预设', 'プリセット', 'الإعداد المسبق'],
    'Not set': ['Sin elegir', 'Não definido', 'Не выбрано', '未设置', '未設定', 'غير محدد'],
    'Switch persona': ['Cambiar persona', 'Trocar persona', 'Сменить персону', '切换用户角色', 'ペルソナを切り替え', 'تبديل الشخصية'],
    'Could not switch persona': ['No se pudo cambiar la persona', 'Não foi possível trocar a persona', 'Не удалось сменить персону', '无法切换用户角色', 'ペルソナを切り替えられませんでした', 'تعذّر تبديل الشخصية'],
    'Open Personas to switch instead.': ['Abre Personas para cambiarla.', 'Abra Personas para trocar.', 'Откройте «Персоны», чтобы сменить.', '请打开“用户角色”页面切换。', 'ペルソナのページから切り替えてください。', 'افتح صفحة الشخصيات للتبديل.'],
    'Nothing to choose from here yet.': ['Aún no hay nada para elegir.', 'Ainda não há nada para escolher.', 'Пока не из чего выбрать.', '这里暂时没有可选项。', 'まだ選べるものがありません。', 'لا يوجد ما تختاره هنا بعد.'],

    // Find a setting
    'In {page}': ['En {page}', 'Em {page}', 'В разделе «{page}»', '在 {page} 中', '{page} 内', 'في {page}'],
    'Type a setting name…': ['Escribe el nombre de un ajuste…', 'Digite o nome de uma configuração…', 'Введите название настройки…', '输入设置名称…', '設定名を入力…', 'اكتب اسم الإعداد…'],
    '{count} settings on this page.': ['{count} ajustes en esta página.', '{count} configurações nesta página.', 'Настроек на странице: {count}.', '此页面共有 {count} 项设置。', 'このページの設定: {count} 件', '{count} إعدادًا في هذه الصفحة.'],
    'No setting matches that.': ['Ningún ajuste coincide.', 'Nenhuma configuração corresponde.', 'Ничего не найдено.', '没有匹配的设置。', '一致する設定はありません。', 'لا يوجد إعداد مطابق.'],

    // Install, what's new
    'Open SillyTavern from your home screen, full screen, without the browser bar.': ['Abre SillyTavern desde la pantalla de inicio, a pantalla completa y sin la barra del navegador.', 'Abra o SillyTavern pela tela inicial, em tela cheia, sem a barra do navegador.', 'Открывайте SillyTavern с главного экрана, на весь экран, без строки браузера.', '从主屏幕全屏打开 SillyTavern，没有浏览器地址栏。', 'ホーム画面から全画面で、ブラウザのバーなしで SillyTavern を開けます。', 'افتح SillyTavern من الشاشة الرئيسية بملء الشاشة ومن دون شريط المتصفح.'],
    'Installed': ['Instalado', 'Instalado', 'Установлено', '已安装', 'インストールしました', 'تم التثبيت'],
    'SillyTavern is on your home screen now.': ['SillyTavern ya está en tu pantalla de inicio.', 'O SillyTavern já está na sua tela inicial.', 'SillyTavern теперь на главном экране.', 'SillyTavern 已添加到主屏幕。', 'SillyTavern がホーム画面に追加されました。', 'أصبح SillyTavern على شاشتك الرئيسية.'],
    'Mobile UI {version}': ['Mobile UI {version}', 'Mobile UI {version}', 'Mobile UI {version}', 'Mobile UI {version}', 'Mobile UI {version}', 'Mobile UI {version}'],

    // Personas page
    'All personas': ['Todas las personas', 'Todas as personas', 'Все персоны', '全部用户角色', 'すべてのペルソナ', 'كل الشخصيات'],
    'Edit {name}': ['Editar a {name}', 'Editar {name}', 'Изменить: {name}', '编辑 {name}', '{name} を編集', 'تعديل {name}'],
    'Edit current': ['Editar la actual', 'Editar a atual', 'Изменить текущую', '编辑当前', '現在のものを編集', 'تعديل الحالية'],

    // Picture viewer
    'Zoom in': ['Acercar', 'Ampliar', 'Приблизить', '放大', '拡大', 'تكبير'],
    'Zoom out': ['Alejar', 'Reduzir', 'Отдалить', '缩小', '縮小', 'تصغير'],
    'Rotate': ['Girar', 'Girar', 'Повернуть', '旋转', '回転', 'تدوير'],
    'Open full size': ['Abrir a tamaño completo', 'Abrir em tamanho real', 'Открыть в полном размере', '查看原图', '原寸で開く', 'فتح بالحجم الكامل'],
    'Save picture': ['Guardar imagen', 'Salvar imagem', 'Сохранить изображение', '保存图片', '画像を保存', 'حفظ الصورة'],

    // Jump button
    'Jump to the latest message': ['Ir al último mensaje', 'Ir para a última mensagem', 'К последнему сообщению', '跳到最新消息', '最新のメッセージへ', 'الانتقال إلى أحدث رسالة'],
    'Latest message': ['Último mensaje', 'Última mensagem', 'Последнее сообщение', '最新消息', '最新のメッセージ', 'أحدث رسالة'],
    // Translate chat
    'Translate chat': ['Traducir chat', 'Traduzir chat', 'Перевести чат', '翻译聊天', 'チャットを翻訳', 'ترجمة الدردشة'],
    'Stop': ['Detener', 'Parar', 'Стоп', '停止', '停止', 'إيقاف'],
    'Translation is off': ['La traducción está desactivada', 'A tradução está desligada', 'Перевод выключен', '翻译已关闭', '翻訳がオフです', 'الترجمة متوقفة'],
    'Turn on "Chat Translation" in Extensions → Manage extensions.': ['Activa "Chat Translation" en Extensiones → Administrar extensiones.', 'Ative "Chat Translation" em Extensões → Gerenciar extensões.', 'Включите «Chat Translation» в Расширения → Управление расширениями.', '请在 扩展 → 管理扩展 中启用 "Chat Translation"。', '拡張機能 → 拡張機能の管理 で「Chat Translation」をオンにしてください。', 'فعّل "Chat Translation" من الإضافات ← إدارة الإضافات.'],
    'Already in {lang}': ['Ya está en {lang}', 'Já está em {lang}', 'Уже на языке: {lang}', '已是{lang}', 'すでに{lang}です', 'الدردشة بالفعل بـ{lang}'],
    'Translating to {lang}… {done}/{total}': ['Traduciendo al {lang}… {done}/{total}', 'Traduzindo para {lang}… {done}/{total}', 'Перевод ({lang})… {done}/{total}', '正在翻译为{lang}… {done}/{total}', '{lang}に翻訳中… {done}/{total}', 'جارٍ الترجمة إلى {lang}… {done}/{total}'],
    'Translation stopped': ['Traducción detenida', 'Tradução interrompida', 'Перевод остановлен', '翻译已停止', '翻訳を停止しました', 'توقفت الترجمة'],
    'Could not reach the translator': ['No se pudo conectar con el traductor', 'Não foi possível acessar o tradutor', 'Переводчик недоступен', '无法连接翻译服务', '翻訳サービスに接続できません', 'تعذّر الوصول إلى المترجم'],
    'Chat shown in {lang}': ['Chat mostrado en {lang}', 'Chat exibido em {lang}', 'Чат показан на языке: {lang}', '聊天已显示为{lang}', 'チャットを{lang}で表示中', 'الدردشة معروضة بـ{lang}'],
    'Some messages could not be translated. Check your internet connection.': ['Algunos mensajes no se pudieron traducir. Revisa tu conexión a internet.', 'Algumas mensagens não puderam ser traduzidas. Verifique sua internet.', 'Некоторые сообщения не переведены. Проверьте подключение к интернету.', '部分消息无法翻译，请检查网络连接。', '一部のメッセージを翻訳できませんでした。ネット接続を確認してください。', 'تعذّرت ترجمة بعض الرسائل. تحقّق من اتصالك بالإنترنت.'],
    'Showing the original text': ['Mostrando el texto original', 'Mostrando o texto original', 'Показан исходный текст', '正在显示原文', '原文を表示中', 'يُعرض النص الأصلي'],
    'Showing {lang}. The original text is kept.': ['Mostrando {lang}. El texto original se conserva.', 'Mostrando {lang}. O texto original é mantido.', 'Показан язык: {lang}. Оригинал сохранён.', '正在显示{lang}，原文已保留。', '{lang}で表示中。原文は保持されます。', 'يُعرض بـ{lang}. النص الأصلي محفوظ.'],
    'Pick a language. The original text is kept.': ['Elige un idioma. El texto original se conserva.', 'Escolha um idioma. O texto original é mantido.', 'Выберите язык. Оригинал сохранится.', '选择一种语言，原文会保留。', '言語を選んでください。原文は保持されます。', 'اختر لغة. سيبقى النص الأصلي محفوظًا.'],
    'Open a chat first.': ['Abre un chat primero.', 'Abra um chat primeiro.', 'Сначала откройте чат.', '请先打开一个聊天。', '先にチャットを開いてください。', 'افتح دردشة أولًا.'],
    'Show original': ['Ver original', 'Ver original', 'Показать оригинал', '显示原文', '原文を表示', 'عرض الأصل'],
    'Translate new replies too': ['Traducir también las respuestas nuevas', 'Traduzir também as novas respostas', 'Переводить и новые ответы', '同时翻译新回复', '新しい返信も翻訳', 'ترجمة الردود الجديدة أيضًا'],
    'Each new reply is shown in the chosen language.': ['Cada respuesta nueva se muestra en el idioma elegido.', 'Cada nova resposta aparece no idioma escolhido.', 'Каждый новый ответ показывается на выбранном языке.', '每条新回复都会以所选语言显示。', '新しい返信は選んだ言語で表示されます。', 'يُعرض كل رد جديد باللغة المختارة.'],
    'Search languages': ['Buscar idiomas', 'Pesquisar idiomas', 'Поиск языка', '搜索语言', '言語を検索', 'البحث عن لغة'],
    'Recent': ['Recientes', 'Recentes', 'Недавние', '最近使用', '最近使った言語', 'الأخيرة'],
    'All languages': ['Todos los idiomas', 'Todos os idiomas', 'Все языки', '全部语言', 'すべての言語', 'كل اللغات'],
    'Languages': ['Idiomas', 'Idiomas', 'Языки', '语言', '言語', 'اللغات'],
    'Uses {provider} through your SillyTavern server. You can change it in Extensions → Chat Translation.': ['Usa {provider} a través de tu servidor de SillyTavern. Puedes cambiarlo en Extensiones → Chat Translation.', 'Usa {provider} pelo seu servidor do SillyTavern. Você pode trocar em Extensões → Chat Translation.', 'Использует {provider} через ваш сервер SillyTavern. Сменить можно в Расширения → Chat Translation.', '通过你的 SillyTavern 服务器使用 {provider}。可在 扩展 → Chat Translation 中更改。', 'SillyTavern サーバー経由で {provider} を使います。拡張機能 → Chat Translation で変更できます。', 'يستخدم {provider} عبر خادم SillyTavern لديك. يمكنك تغييره من الإضافات ← Chat Translation.'],
};

LANGS.forEach((code, column) => {
    const entries = {};
    for (const [english, row] of Object.entries(STRINGS)) {
        if (row[column]) entries[english] = row[column];
    }
    addDictionary(code, entries);
});
