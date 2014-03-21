/* Prepares expandable list of amenities on search page. */
function prepareList() {
	$('#amen_exp_list').find('li:has(ul.collapsible)')
			.addClass('closed')
			.children('ul').hide();
};

/* Prepares expandable list of amenities on search page. */
function prepareMaps() {
	$('#results').find('div:has(img.collapsible)')
			.addClass('closed')
			.children('img').hide();
};

/* Expands or contracts all collapsible elements under header. */
function toggle(header) {
	header.toggleClass('open');
	header.children('.collapsible').toggle('medium');
	return false;
};

/* Expands all collapsible elements. */
function expandAll() {
        $('.closed').addClass('open');
        $('.closed').children('.collapsible').show('medium');
}

/* Collapses all collapsible elements. */
function collapseAll() {
        $('.closed').removeClass('open');
        $('.closed').children('.collapsible').hide('medium');
}

/* Set up lists when page is loaded. */
$(document).ready( function() {
	prepareList()
});
