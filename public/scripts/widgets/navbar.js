import Application from '../app.js'
/**
 * populates a navigation bar
 */
class Navbar {
	constructor(title) {
		this.title = title
		this.dropdowns = []
	}
	addDropdownItem(props) {
		let $item = $('<div>')
		$item.addClass('dropdown-item')
		$item.text(props.label)
		$item.on('click', props.action)
		this.dropdowns.push($item)
	}
	/**
	 * creates a navigation bar with menu items
	 * and dropdowns
	 */
	render() {
		var $logo = $('<div>')
		$logo.addClass('navbar-brand')
		var $img = $('<img>')
		// absolute path
		$img.attr('src', '/images/logo.png')
		$logo.append($img)

		var $title = $('<label>')
		$title.attr('id', 'page-title')
		$title.text(this.title)

		let $profile = $('<div>')
		$profile.addClass('navbar-item text-center')
		let $icon = $('<div>')
		$icon.addClass('material-icons')
		$icon.text('portrait')
		let $name = $('<p>')
		let user = Application.getUser(false)
		$name.text(user ? user.name : 'guest')
		$name.addClass('text-white')
		$profile.append($icon,$name)
		
		var $navItem = $('<div>')
		$navItem.addClass('navbar-item float-right')

		let $dropdown = $('<div>')
		$dropdown.addClass('dropdown')

		let $button = $('<button>')
		$button.addClass('btn dropdown-toggle')
		$button.attr('type', 'button')
		$button.attr('data-toggle', 'dropdown')
		var $menu_icon = $('<div>')
		$menu_icon.addClass('material-icons')
		$menu_icon.text('menu')
		$button.append($menu_icon)
		  
		let $dropdownMenu = $('<div>')
		$dropdownMenu.addClass('dropdown-menu')
		$dropdownMenu.attr('id', 'dropdownMenu')
		$dropdownMenu.attr('aria-labelledby', 'dropdownMenu')
		for (var i = 0; i < this.dropdowns.length; i++) {
			$dropdownMenu.append(this.dropdowns[i])
		}

		$dropdown.append([$button, $dropdownMenu])
		$navItem.append($dropdown)

		return [$logo, $title, $profile, $navItem]
	}
	
	
}

export default Navbar