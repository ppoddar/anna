const sections = {
    'menu': {
        title: 'MENU',
        page: './menu.html'
    }
}
/*
 * Common functions are defiend here.
 * This script is included in each html page
 */

 /*
  * Populates given navbar element with given items of each section  
  */
function build_navbar($navbar, sections) {
    console.log(`adding ${Object.keys(sections).length} sections to ${$navbar.attr('id')}`)
    for (const [id, section] of Object.entries(sections)) {
        var $item = build_navbar_item(id, section)
        $navbar.append($item)
    }
}

/*
 * Creates a navbar item element with given section  
 */
 function build_navbar_item(id, section) {
    console.log(`build_navbar_item: ${JSON.stringify(section)}`)
    var $item = $('<a>')
    $item.addClass("w3-bar-item w3-button w3-padding-large w3-hide-small")
    $item.text(section.title)
    $item.attr('href', section.page)
    return $item
}


/*
 * loads a page as main content.
 * The scripts in the page will be executed 
*/
// function showPage($main, page) {
//     $main.load(page, function() {
//         console.log('showPage ' + page + ' loaded')
//     })
// }
