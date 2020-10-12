//grabs the url from the input
function grabUrl() {
    let urlInput = document.getElementById('url');
    console.log(urlInput.value);
}

//custom html component
class TreeNode extends HTMLElement {

    //check if the component is expanded
    get expand() {
        return this.hasAttribute('expand');
    }

    //set the expand option for component
    set expand(val) {
        if(val) {
            this.setAttribute('expand', '')
        } else {
            this.removeAttribute('expand');
        }
    }

    //switch the expand position by checking if it already exists
    switchExpand() {
        if(this.hasAttribute('expand')) {
            this.removeAttribute('expand');
        } else {
            this.setAttribute('expand', '')
        }
    } 

    //constructor to add event listener click to switch the expansion
    constructor() {
        super();

        this.addEventListener('click', e => {
            this.switchExpand();
        })
    }
}


//define the node
customElements.define('tree-node', TreeNode);