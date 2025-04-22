export async function translate(lang = 'es', context = {}) {
    for (const i in context) {
        const value = context[i];
        context[i] = handleTranslateStr(lang, i);
    }
    return context;
}

function handleTranslateStr(lang, key) {
    switch (key) {
        case 'dayStr':
            return lang === 'es' ? 'hace días' : 'day(s) ago';
        case 'hourStr':
            return lang === 'es' ? 'hace horas' : 'hour(s) ago';
        case 'minStr':
            return lang === 'es' ? 'hace minutos' : 'min(s) ago';
        case 'secStr':
            return lang === 'es' ? 'hace segundos' : 'second(s) ago';
        case 'viewDetail':
            return lang === 'es' ? 'Ver detalles' : 'View detail';
        case 'success':
            return lang === 'es' ? 'Exitoso' : 'Successful';
        case 'warning':
            return lang === 'es' ? 'Advertencia' : 'Warning';
        case 'error':
            return lang === 'es' ? 'Error' : 'Error';
        case 'noti':
            return lang === 'es' ? 'Notificación' : 'Notification';
        case 'defaultErrMsg':
            return lang === 'es'
                ? 'El asistente virtual no puede responder en este momento, inténtelo nuevamente más tarde.'
                : 'The virtual assistant is currently unable to respond, please try again later.';
        case 'notValidPackage':
            return lang === 'es' ? 'Paquete no válido' : 'Package not valid';
        case 'paymentMethodTitle':
            return lang === 'es' ? 'Método de pago' : 'Payment method';
        case 'notConnect':
            return lang === 'es'
                ? 'No se puede conectar al servidor. Por favor, inténtelo de nuevo más tarde.'
                : 'Unable to connect to server. Please try again later.';
        case 'sender':
            return lang === 'es' ? 'Tú' : 'You';
        case 'receiver':
            return lang === 'es' ? 'Asistente virtual' : 'Virtual assistant';
        case 'callOutStr':
            return lang === 'es'
                ? '¿Está solicitando suscribirse al paquete %s? ¡Haga clic en %s para continuar suscribiéndose al paquete!'
                : 'Are you requesting to subscribe to package %s? Please click on %s to continue subscribing to the package!';
        case 'defaultBotMessage':
            return lang === 'es'
                ? 'Hola ¿Con qué contenido necesitas ayuda?'
                : 'Hello. What content do you need support with?';
        case 'endConvMsg':
            return lang === 'es'
                ? '¡Gracias por su interés!'
                : 'Thank you for your interest!';
        case 'recently':
            return lang === 'es'
                ? 'Recién terminado'
                : 'Recent';
        case 'emptyText':
            return lang === 'es'
                ? 'Por favor ingresa el contenido'
                : 'Please enter content';
        default:
            return lang === 'es' ? '' : 'null';
    }
}
