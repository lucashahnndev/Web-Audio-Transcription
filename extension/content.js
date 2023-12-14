// Função para adicionar ícone a um elemento <audio>
function addIconToAudioElement(audioElement) {
    // Cria um elemento de ícone
    const icon = document.createElement('img');
    icon.src = 'https://tricontroledeacesso.com/static/logo/icon128.png'; // Ajuste o caminho conforme a localização real do seu ícone
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.marginLeft = '5px';
    icon.style.cursor = 'pointer';
    icon.title = 'Transcrever audio para texto';

    icon.addEventListener('click', () => {
        //chrome.runtime.sendMessage({ action: 'openPopup' });
        add_popup(audioElement)
    });

    audioElement.parentNode.insertBefore(icon, audioElement.nextSibling);
}

// Função para verificar as mudanças no DOM
function observeDOM() {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    // Verifica se o nó adicionado é um elemento <audio>
                    if (node instanceof HTMLAudioElement) {
                        addIconToAudioElement(node);
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function add_popup(audioElement) {
    if (elementoExiste('draggableElement') == false) {

        const novoElemento = document.createElement('div');
        // Defina estilos específicos para o novo elemento
        novoElemento.style.position = 'fixed'; // Ou 'absolute', dependendo do comportamento desejado
        novoElemento.style.top = '10px'; // Posição vertical
        novoElemento.style.left = '10px'; // Posição horizontal
        novoElemento.style.zIndex = '9999'; // Valor de ordem em relação a outros elementos

        document.body.appendChild(novoElemento);

        novoElemento.innerHTML += `
                                    <div  id="draggableElement" class="draggableElement_popup">
                                        <div class="trancription_toolBar">
                                            <botton class="trancription_config_button" id="config_popup" >\u2699</botton>
                                                <div class="trancription_config">
                                                    <div class="trancription_theme">
                                                        Tema
                                                        <select class="theme_select">
                                                            <option value="system">
                                                                Sistema
                                                            </option>
                                                            <option value="dark">
                                                                Escuro
                                                            </option>
                                                            <option value="light">
                                                                Claro
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div class="trancription_transparent">
                                                        Transparencia
                                                        <label  class="switch">
                                                            <input class="trasnparent_select" type="checkbox">
                                                            <span class="slider"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            <botton class="trancription_close_button" id="closed_popup" >\u2716</botton>
                                        </div>
                                        <div class="transcription_title">Transcrição do áudio</div>
                                        <div class="content_trancription_div">
                                            <p  class="loader_div">
                                                <div  class="c-loader">
                                                </div>
                                                Transcrevendo seu audio...
                                            </p>
                                        </div>
                                        <div class="logo_tri">
                                            <img  src="https://tricontroledeacesso.com/site/imagens/logo black.png"></img>
                                        <div>
                                    </div>
                                    `

        set_value_in_html_config()
        open_config()
        close_popup()
        drag_popup()
    } else {
        document.getElementById('draggableElement').style.display = 'block'
        add_loader()
    }
    // Adiciona os eventos de arraste ao elemento
    transcript_insert(audioElement)

}

function transcript_insert(audioElement) {
    const audioSrc = audioElement.src;

    // Verifica se o src é um Blob URL
    if (audioSrc.startsWith('blob:')) {
        // Converte o Blob URL para um Blob
        fetch(audioSrc)
            .then(response => response.blob())
            .then(audioBlob => {
                // Converte o Blob para
                // Converte o Blob para um File
                const audioFile = new File([audioBlob], 'audio_file.ogg', { type: 'audio/mpeg' }); // Substitua 'audio_file.mp3' pelo nome correto do arquivo e defina o tipo MIME adequado


                const formData = new FormData();
                formData.append('file', audioFile);
                const apiURL = "https://tricontroledeacesso.com/_api_/upload_audio/";
                fetch(apiURL, { method: 'POST', body: formData })
                    .then(response => {
                        response.json()
                            .then(data => {
                                add_trancribed_text(data['transcribed_text'])
                            })
                    })
            })
            .catch(error => {
                console.error('Erro ao obter o Blob do src:', error);
            });
    } else {
        console.error('O src não aponta para um Blob URL.');
    }
}

function close_popup() {
    closed_popup = document.getElementById('closed_popup')
    closed_popup.addEventListener('click', () => {
        document.getElementById('draggableElement').style.display = 'none'
    });
}

function drag_popup() {

    draggableElement = document.getElementById('draggableElement');

    draggableElement.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    // Função para iniciar o arraste
    function dragStart(event) {
        isDragging = true;
        const boundingRect = draggableElement.getBoundingClientRect();
        offsetX = event.clientX - boundingRect.left;
        offsetY = event.clientY - boundingRect.top;
    }

    // Função para terminar o arraste
    function dragEnd() {
        isDragging = false;
    }

    // Função para atualizar a posição do elemento enquanto arrasta
    function drag(event) {
        if (isDragging) {
            draggableElement.style.left = event.clientX - offsetX + 'px';
            draggableElement.style.top = event.clientY - offsetY + 'px';
        }
    }

    // Adiciona os eventos de arraste ao elemento
    draggableElement.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);



}

function elementoExiste(id) {
    return document.getElementById(id) !== null;
}


function add_loader() {
    document.querySelector('.content_trancription_div').innerHTML = `<p  class="loader_div">
                                                                        <div  class="c-loader">
                                                                        </div>
                                                                        Transcrevendo seu audio...
                                                                    </p>
                                                                    `
}

function add_trancribed_text(text) {
    document.querySelector('.content_trancription_div').innerHTML = `<div id="trancription_result" class="text_transcribed">
                                                                        <span class="trancription_result_copy_button">\ud83d\udccb Copiar</span>
                                                                        <div class="Result" id="trancription_text_result_">${text}</div>
                                                                    </div>`


    const botaoCopiar = document.querySelector('.trancription_result_copy_button');

    // Adiciona um event listener para o botão de cópia
    botaoCopiar.addEventListener('click', function () {
        copyToClipboard('trancription_text_result_');
    });


}

function copyToClipboard(elementId) {
    // Seleciona o elemento com base no ID fornecido
    const element = document.getElementById(elementId);
    const botaoCopiar = document.querySelector('.trancription_result_copy_button');

    if (element) {
        // Seleciona o texto dentro do elemento
        const textToCopy = element.innerText || element.textContent;

        // Cria um elemento de texto temporário para copiar o texto
        const tempElement = document.createElement('textarea');
        tempElement.value = textToCopy;

        // Adiciona o elemento ao corpo do documento
        document.body.appendChild(tempElement);

        // Seleciona o texto dentro do elemento
        tempElement.select();

        // Copia o texto para a área de transferência
        document.execCommand('copy');

        // Remove o elemento temporário
        document.body.removeChild(tempElement);

        // Feedback ou outra ação após a cópia
        botaoCopiar.innerHTML = '\u2713 Copiado'

    }
}

function open_config() {
    open_config_popup = true
    config_element = document.getElementById('config_popup')
    const elementoAlvo = document.querySelector('.trancription_config');
    config_element.addEventListener('click', () => {
        open_config_popup = true
        document.querySelector('.trancription_config').style.display = 'flex'
    });
    document.addEventListener('click', function (event) {
        if (elementoAlvo.contains(event.target) || open_config_popup == true) {
            open_config_popup = false
        } else {
            open_config_popup = true
            document.querySelector('.trancription_config').style.display = 'none'
        }
    });


    change_transparent()
    chenge_theme()
}

function change_transparent() {
    element_trasnparent = document.querySelector('.trasnparent_select')
    element_trasnparent.addEventListener('change', function (event) {
        if (element_trasnparent.checked == true) {
            transparent = '_trasnparent'
        } else {
            transparent = ''
        }
        chenge_styles(theme, transparent)
    });
}

function chenge_theme() {
    element_ = document.querySelector('.theme_select')
    element_.addEventListener('change', function (event) {
        theme = element_.value
        chenge_styles(theme, transparent)
    });

}

function add_style() {
    get_theme(function (theme, transparent) {
        if (theme == "system") {
            theme = get_theme_from_system();
        }
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.type = 'text/css';
        linkElement.href = chrome.runtime.getURL('styles.css');
        document.head.appendChild(linkElement);

        const linkElement_color = document.createElement('link');
        linkElement_color.rel = 'stylesheet';
        linkElement_color.type = 'text/css';
        linkElement_color.href = chrome.runtime.getURL(`color_${theme}${transparent}.css`);
        document.head.appendChild(linkElement_color);
    });
}

function chenge_styles(theme, transparent) {
    save_theme(theme, transparent)
    const linkElement = document.querySelector('link[href="color_dark_trasnparent.css"]');
    if (linkElement) {
        linkElement.remove();
    }
    const linkElement1 = document.querySelector('link[href="color_light_trasnparent.css"]');
    if (linkElement1) {
        linkElement1.remove();
    }
    const linkElement2 = document.querySelector('link[href="color_dark.css"]');
    if (linkElement2) {
        linkElement2.remove();
    }
    const linkElement3 = document.querySelector('link[href="color_light.css"]');
    if (linkElement3) {
        linkElement3.remove();
    }
    add_style()
}

function save_theme(theme, transparent) {
    const dados = {
        'theme': theme,
        'transparent': transparent
    };

    // Salvando os dados no armazenamento de sincronização
    chrome.storage.sync.set(dados, function () {
        console.log('Dados salvos no armazenamento de sincronização:', dados);
    });
}

function set_value_in_html_config() {
    get_theme(function (theme, transparent) {

        document.querySelector('.theme_select').value = theme
        if (transparent == '_transparent') {
            document.querySelector('.trasnparent_select').checked
        }
    })

}

function get_theme(callback) {
    chrome.storage.sync.get(['theme', 'transparent'], function (result) {
        let theme = result.theme || 'system';
        let transparent = result.transparent || '';
        callback(theme, transparent);
    });
}


function get_theme_from_system() {
    theme = ''
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark'
        // Faça algo específico para o tema escuro...
    } else {
        theme = 'light'
        // Faça algo específico para o tema claro...
    }
    return theme
}

// Inicia a observação do DOM após o carregamento da página
window.addEventListener('load', observeDOM);
let isDragging = false;
let offsetX, offsetY;
var theme = 'system'
var _trasnparent = '_trasnparent'
add_style()
