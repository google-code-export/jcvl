/*
 * jColumnListView
 *
 * Documentation: http://code.google.com/p/jcvl
 *
 * Creates a column view (like a Mac Finder) from <UL> list. Supports multiselect.
 * Since v0.2 can provide splitters between columns.
 *
 * Requires jQuery 1.4+
 * See cvl.css for CSS rules
 *
 * Control creates <input> element for each checked item with the same 
 * name (paramName[] for PHP, for example)
 *
 * jColumnListView() returns jCVL_ColumnListView object which is native list view. 
 * See comments below to operate on this object directly.
 *
 * Parameters:
 *   id            - ID of ColumnListView control
 *   columnWidth   - ...
 *   columnHeight  - size of column
 *   columnMargin  - right margin of column
 *   columnNum     - maximum number of columns
 *   paramName     - name of form parameter
 *   elementId     - ID of <UL> list to get data from
 *   appendToId    - ID of element to append this control
 *   removeULAfter - if true remove <UL> list from DOM after get data
 *   showLabels    - show or not labels area
 *
 * Parameters v0.2:
 *   useSplitters     - If true ColumnListView will use splitters for columns
 *   columnMinWidth   - 
 *   columnMaxWidth   - Min/Max values for width (used as constraints for splitters)
 *   splitterLeftMode - If true splitter will modify only left column (both column width otherwise)
 *
 * Parameters v0.2.4
 *   singleCheck      - only one item can be checked
 *
 * Parameters v0.3.2
 *   leafMode         - If true control will store only leaf values (that has not any children items)
 *
 * Parameters v0.4.1
 *   textFormat           - format for column item text. Description of formats see above.
 *   childrenCountFormat  - format of children counter
 *   emptyChildrenCounter - Show or not children counter when item has no children
 *
 * Usage example:
 * 
 *      jQuery.fn.jColumnListView({
 *          id:            'cl2',
 *          columnWidth:   120,
 *          columnHeight:  180,
 *          columnMargin:  5,
 *          paramName:     'product_categories',
 *          columnNum:     3,
 *          appendToId:    't2',
 *          elementId:     'categories',
 *          removeULAfter: true,
 *          showLabels:    false
 * // Since version 0.2
 *          useSplitters:     true,
 *          splitterLeftMode: false,
 *          columnMinWidth:   90,
 *          columnMaxWidth:   180
 * // Since version 0.2.4
 *          singleCheck:      false
 * // Since version 0.3.2
 *          leafMode:         true
 * // Since version 0.4.1
 *          textFormat:           '%cvl-children-counter% %cvl-text%',
 *          childrenCountFormat:  '[%cvl-count%]',
 *          emptyChildrenCounter: false
 *		});
 *
 * Author:   Alexander Khizha <khizhaster@gmail.com>
 * Version:  0.4.1
 * Started:  25.03.2011
 * Modified: 11.04.2011
 * License:  GPL v2.0
 */

function CVL_AdjustMinMax(val, min, max)
{
	return val <= min 
		? min
		: val >= max
			? max
			: val;
}

// -----------------------------------------------------------------------------
// Jaws (labels like [x|Some Label])
// 
// Parameters:
//   id          - ID for Jaw
//   text        - Text label
//   value       - Value, passed to <input> element
//   onDelClick  - onClick handler for Del button
//   onNameClick - onClick handler for name element
//   paramName   - Name of <input> element
//
function jCVL_Jaw (opts)
{
	var emptyHandler = function (ev, id, text) {};

	this.id          = opts.id          || 'cvl-jaw';
	this.text        = opts.text        || "";
	this.onDelClick  = opts.onDelClick  || emptyHandler;
	this.onNameClick = opts.onNameClick || emptyHandler;
	this.paramName   = opts.paramName   || 'cvl-param';
	this.value       = opts.value       || this.text;

	var clSel = 'cvl-selected-jaw', clDel = 'cvl-selected-del', clName = 'cvl-selected-name';
	
	var elem    = $('<span>')
		.attr('class', clSel)
		.attr('id',    this.id);
	var that = this;
	var delElem = $('<span>')
		.attr('class', clDel)
		.text('x')
		.click(function (ev) { that.doOnDelClick(ev); });
	var nameElem = $('<span>')
		.attr('class', clName)
		.text(this.text)
		.click(function (ev) { that.doOnNameClick(ev); });
	var valElem = $('<input type="hidden">')
		.attr('name',  this.paramName)
		.attr('value', this.value);

	elem.append(valElem).append(delElem).append(nameElem);
	this.elems = { 'elem': elem, 'delElem': delElem, 'nameElem': nameElem, 'valElem': valElem };
}

// Sets text and value for jaw label
jCVL_Jaw.prototype.setText = function (text, value) {
	this.text  = text;
	this.value = value || this.text;
	this.elems.nameElem.text(this.text);
	this.elems.valElem.attr('value', this.value);
}

// Sets value
jCVL_Jaw.prototype.setValue = function (value) {
	this.elems.valElem.attr('value', this.value = value);
}

// Returns a text from label
jCVL_Jaw.prototype.getText = function () {
	return this.text;
}

// Returns value
jCVL_Jaw.prototype.getValue = function () {
	return this.value;
}

// Sets onClick Del handler
jCVL_Jaw.prototype.setOnDelClick = function (cb) {
	this.onDelClick = cb;
}

// Real onClick Del handler
jCVL_Jaw.prototype.doOnDelClick = function (event) {
	this.onDelClick(event, this.id, this.text, this.value);
}

// Sets onClick name handler
jCVL_Jaw.prototype.setOnNameClick = function (cb) {
	this.onNameClick = cb;
}

// Real onClick name handler
jCVL_Jaw.prototype.doOnNameClick = function (event) {
	this.onNameClick(event, this.id, this.text, this.value);
}

// Returns HTML element itself
jCVL_Jaw.prototype.get = function () {
	return this.elems.elem;
}

// Appends element to given one
jCVL_Jaw.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.elems.elem);
}

// Removes jaw from DOM with a little animation
jCVL_Jaw.prototype.remove = function (cb) {
	var that = this;
	this.elems.elem.fadeOut(200, function () { that.get().remove(); if (cb) cb(); });
}

jCVL_Jaw.prototype._remove = function (cb) {
	this.get().remove();
	if (cb)
		cb();
}

// -----------------------------------------------------------------------------
// Jaw Area
//
// Parameters:
//   id             - Create with this ID
//   unique         - Store only unique values
//   onDelClick     - onClick handler for item's Del
//   onNameClick    - onClick handler for item's name
//   
// Note: If 'elementId' is defined it prefer to 'id'.
//
function jCVL_JawArea (opts)
{
	var emptyHandler = function (ev, id, text) {};
	this.jaws = [];
	
	this.unique       = typeof(opts.unique) == 'boolean' ? opts.unique : true;
	this.id           = opts.id             || 'cvl-jaw-area';
	this.onDelClick   = opts.onDelClick     || emptyHandler;
	this.onNameClick  = opts.onNameClick    || emptyHandler;
	this.paramName    = opts.paramName      || 'cvl-param';

	this.elem   = $('<div>')
		.attr('class', 'cvl-jaw-area')
		.attr('id', this.id);
}

// Returns area HTML element
jCVL_JawArea.prototype.get = function () {
	return this.elem;
}

// Appends element to given one
jCVL_JawArea.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.elem);
}

jCVL_JawArea.prototype._has = function (bTextOrValue, t) {
	var h = false;
	for (var i=0; i<this.jaws.length && !h; i++)
	{
		var v = !!bTextOrValue ? this.jaws[i].getText() : this.jaws[i].getValue();
		if (v == t)
			h = true;
	}
	return h;
}

// Returns true if area has label with 'text'
jCVL_JawArea.prototype.hasText = function (text) {
	return this._has(true, text);
}

// Returns true if area has label with 'value'
jCVL_JawArea.prototype.hasValue = function (value) {
	return this._has(false, value);
}

// Add new label to area
// Skip existing labels if this.unique is true
jCVL_JawArea.prototype.addJaw = function (text, value) {
	var val = value || text;
	if (!this.unique || !this.hasValue(val))
	{
		var that  = this;
		var arrId = this.jaws.length;
		var id    = this.id + '-jaw' + arrId;
		var that  = this;
		var j = new jCVL_Jaw({
			id:         id,
			text:       text,
			value:      val,
			paramName:  this.paramName
		});
		j.setOnDelClick(function (ev, ev_id, ev_text, ev_value)  { that.onJawDelClick(ev,  ev_id, ev_text, ev_value, j); });
		j.setOnNameClick(function (ev, ev_id, ev_text, ev_value) { that.onJawNameClick(ev, ev_id, ev_text, ev_value, j); });
		this.jaws.push(j);
		this.elem.append(j.get());
	}
}

// Removes a label with given text
jCVL_JawArea.prototype.delJaw = function (value, cb) {
	for (var i=0; i<this.jaws.length; i++)
	{
		if (this.jaws[i].getValue() == value)
		{
			var j = this.jaws.splice(i, 1)[0];
			j.remove(cb);
			break;
		}
	}
}

// onClick handler for Del button of each label
jCVL_JawArea.prototype.onJawDelClick = function (ev, id, text, value, jaw) {
	var that = this;
	this.delJaw(value, function () {
		that.onDelClick(ev, id, text, value);
	});
}

// onClick handler for name element of each label
jCVL_JawArea.prototype.onJawNameClick = function (ev, id, text, value, jaw) {
	this.onNameClick(ev, id, text, value);
}

jCVL_JawArea.prototype.setOnDelClick = function (cb) {
	this.onDelClick = cb;
}

jCVL_JawArea.prototype.setOnNameClick = function (cb) {
	this.onNameClick = cb;
}

jCVL_JawArea.prototype.hide = function () {
	this.elem.hide();
}

jCVL_JawArea.prototype.show = function () {
	this.elem.show();
}

jCVL_JawArea.prototype.clear = function () {
	jQuery.each(this.jaws, function (index, jaw) {
		jaw._remove();
	});
	this.jaws = [];
}

// -----------------------------------------------------------------------------
// ColumnItem 
// Item with checkbox for lsit column
//
// Parameters:
//   id                   - ID of item
//   text                 - label string
//   value                - element value
//   checked              - initial state of checkbox
//   onClick              - handler for whole item
//   onCheckboxClick      - handler for checkbox only
//   childrenNum          - number of children (default 0)
//   textFormat           - format of text of item. Supported tags: 
//                              %cvl-text%, %cvl-children-counter%.
//                              Default is "%cvl-text%"
//   childrenCountFormat  - format of children counter. Supported tags: 
//                              %cvl-count%.
//                              Default is null (not used).
//                              This text will replace %cvl-children-counter% tag in item text.
//   emptyChildrenCounter - if true children counter will be renderer even if item has no children (counter will be 0).
//                              Otherwise item will not render children counter.
//                              Default: false
//

var jCVL_ColumnItemTags = {
	'text':             '%cvl-text%',
	'childrenCounter':  '%cvl-children-counter%',
	'childrenNumber':   '%cvl-count%'
};

function jCVL_ColumnItem (opts)
{
	var emptyHandler = function (ev, item) {};

	var defOpts = {
		id:                   'cvl-column-item',
		text:                 'Column Item',
		value:                '',
		onClick:              emptyHandler,
		onCBClick:            emptyHandler,
		parentCol:            null,
		checked:              false,
		fullPath:             null,
		childrenNum:          0,
		textFormat:           jCVL_ColumnItemTags.childrenCounter + ' ' + jCVL_ColumnItemTags.text, // e.g. '[4] Item Text'
		childrenCountFormat:  '[' + jCVL_ColumnItemTags.childrenNumber + ']', // e.g. '[4]'
		emptyChildrenCounter: true,
		childIndicator:       null
	};
	this.opts = jQuery.extend(defOpts, opts);
	
	this.tags = {
		'text':      new RegExp(jCVL_ColumnItemTags.text, 'g'),
		'chcounter': new RegExp(jCVL_ColumnItemTags.childrenCounter, 'g'),
		'chnum':     new RegExp(jCVL_ColumnItemTags.childrenNumber, 'g')
	};
	
	var that = this;
	this.cl = { 
		'Elem':     'cvl-column-item',
		'CB':       'cvl-column-item-checkbox',
		'CBBox':    'cvl-column-item-checkbox-box',
		'Label':    'cvl-column-item-label',
		'Selected': 'cvl-column-item-selected'
	};

	var elem = $('<div>')
		.attr('class', this.cl.Elem)
		.attr('id',    this.opts.id);
	var cbBoxElem = $('<div>')
		.attr('class', this.cl.CBBox);
	var cbElem = $('<input type="checkbox">')
		.attr('class',   this.cl.CB)
		.attr('checked', this.opts.checked)
		.click(function(ev) { that.doOnCheckboxClick(ev); });
	var labelElem = $('<span>')
		.attr('class', this.cl.Label)
		.text(this._renderText())
		.click(function (ev) { that.doOnClick(ev); });
	cbBoxElem.append(cbElem);
	elem.append(cbBoxElem).append(labelElem);
		
	this.elems = { 'elem': elem, 'checkbox': cbElem, 'label': labelElem };
}

// Returns html element itself
jCVL_ColumnItem.prototype.get = function () {
	return this.elems.elem;
}

// Appends element to given one
jCVL_ColumnItem.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.elems.elem);
}

// Return true if checkbox is checked
jCVL_ColumnItem.prototype.isChecked = function () {
	return this.elems.checkbox.is(':checked');
}

jCVL_ColumnItem.prototype.setChecked = function (bCheck) {
	this.elems.checkbox.attr('checked', !!bCheck);
}

// Toggle checkbox state
jCVL_ColumnItem.prototype.toggle = function () {
	this.elems.checkbox.attr('checked', !this.isChecked());
}

// Returns text label of item
jCVL_ColumnItem.prototype.getText = function () {
	return this.opts.text;
}

// Returns element value
jCVL_ColumnItem.prototype.getValue = function () {
	return this.opts.value;
}

// Sets text label of item
jCVL_ColumnItem.prototype.setText = function (text) {
	this.opts.text = text;
	this.elems.label.text(this._renderText());
}

// Sets element value
jCVL_ColumnItem.prototype.setValue = function (val) {
	this.opts.value = val;
}

// Set/Get full path for element (path to root column item)
jCVL_ColumnItem.prototype.setFullPath = function (path) {
	this.opts.fullPath = path;
}

jCVL_ColumnItem.prototype.getFullPath = function () {
	return this.opts.fullPath;
}

// Return true if whole item is selected
jCVL_ColumnItem.prototype.isSelected = function () {
	return this.elems.elem.hasClass(this.cl.Selected);
}

// Sets selected state
jCVL_ColumnItem.prototype.setSelected = function (bSelected) {
	var bs = typeof(bSelected == 'boolean') ? bSelected : true;
	var is = this.isSelected();

	if (bs && !is)
		this.elems.elem.addClass(this.cl.Selected);
	else if (!bs && is)
		this.elems.elem.removeClass(this.cl.Selected);
}

// Sets onClick handler
jCVL_ColumnItem.prototype.setOnClick = function (cb) {
	this.opts.onClick = cb;
}

jCVL_ColumnItem.prototype.fireOnClick = function () {
	this.elems.label.click();
}

// Calls client onClick handler
jCVL_ColumnItem.prototype.doOnClick = function (ev) {
	ev.stopPropagation();
	this.setSelected(true);
	this.opts.onClick(ev, this);
};

// Sets onClick handler
jCVL_ColumnItem.prototype.setOnCheckboxClick = function (cb) {
	this.opts.onCBClick = cb;
}

jCVL_ColumnItem.prototype.fireOnCheckboxClick = function () {
	this.elems.checkbox.click();
}

// Calls client onCheckboxClick handler
jCVL_ColumnItem.prototype.doOnCheckboxClick = function (ev) {
	this.opts.checked = this.elems.checkbox.is(':checked');
	this.opts.onCBClick(ev, this);
}

// Returns parent column object
jCVL_ColumnItem.prototype.getParentColumn = function () {
	return this.opts.parentCol;
}

// Set/Get information about children number
jCVL_ColumnItem.prototype.setChildrenNumber = function (num) {
	this.opts.childrenNum = parseInt(num);
}

jCVL_ColumnItem.prototype.getChildrenNumber = function () {
	return this.opts.childrenNum;
}

jCVL_ColumnItem.prototype.hasChildren = function () {
	return this.opts.childrenNum > 0;
}

// Set/Get formats
// Set* functions update item
jCVL_ColumnItem.prototype.setTextFormat = function (fmt) {
	this.opts.textFormat = fmt;
	this.updateItem();
}

jCVL_ColumnItem.prototype.getTextFormat = function () {
	return this.opts.textFormat;
}

jCVL_ColumnItem.prototype.setChildrenCountFormat = function (fmt) {
	this.opts.childrenCountFormat = fmt;
	this.updateItem();
}

jCVL_ColumnItem.prototype.getChildrenCountFormat = function () {
	return this.opts.childrenCountFormat;
}

jCVL_ColumnItem.prototype.setEmptyChildrenCounter = function (bShow) {
	this.opts.emptyChildrenCounter = !!bShow;
	this.updateItem();
}

jCVL_ColumnItem.prototype.getEmptyChildrenCounter = function () {
	return this.opts.emptyChildrenCounter;
}

// Render counter
jCVL_ColumnItem.prototype._renderChildrenCounter = function () {
	var cn  = this.opts.childrenNum;
	var fmt = this.opts.childrenCountFormat;
	var emp = this.opts.emptyChildrenCounter;
	var str = '';
	
	if (fmt && fmt != '' && (cn > 0 || emp))
		str = fmt.replace(this.tags.chnum, cn);

	return str;
}

// Render item text depends on text and counter formats
jCVL_ColumnItem.prototype._renderText = function () {
	var fmt = this.opts.textFormat;
	var str = '';
	
	str = fmt.replace(this.tags.text,      this.opts.text);
	str = str.replace(this.tags.chcounter, this._renderChildrenCounter());
	
	return str;
}

// Updates item (change text if format has been changed, etc)
jCVL_ColumnItem.prototype.updateItem = function () {
	this.setText(this.getText()); // Re-render text
}


// -----------------------------------------------------------------------------
// Column
//
// Parameters:
//   id       - ID of column element
//   width    - column width
//   height   - column height
//   margin   - margin-right for column
//   parent   - parent item of this column
//
function jCVL_Column(opts)
{
	var emptyHandler = function (ev, index, item) {};

	var defOpts = {
		id:         'cvl-column',
		maxWidth:   250,
		minWidth:   150,
		width:      200,
		height:     200,
		margin:     10,
		parentItem: null,
		onClick:         emptyHandler,
		onCheckboxClick: emptyHandler,
		onColumnClick:   emptyHandler,
		textFormat:           jCVL_ColumnItemTags.text,
		childrenCountFormat:  null,
		emptyChildrenCounter: false
	};
	this.opts            = jQuery.extend(defOpts, opts);
	this.opts.width      = CVL_AdjustMinMax(this.opts.width, this.opts.minWidth, this.opts.maxWidth);
	this.opts.defWidth   = this.opts.width;

	this.id              = this.opts.id;
	this.data            = [];
	this.parentItem      = this.opts.parentItem;
	this.parentText      = this.parentItem ? this.parentItem.getText() : undefined;
	this.parentValue     = this.parentItem ? this.parentItem.getValue() : undefined;
	this.items           = [];
	this.curItem         = undefined;
	this.curItemIndex    = -1;
	this.onClick         = this.opts.onClick;
	this.onCheckboxClick = this.opts.onCheckboxClick;
	this.onColumnClick   = this.opts.onColumnClick;
	this.simpleMode      = false;
	
	this.elem = $('<div>')
		.attr('id', this.id)
		.attr('class', 'cvl-column')
		.css({ 'width': this.opts.width, 'height': this.opts.height, 'margin-right': this.opts.margin });
	
	var that = this;
	this.elem.click(function (ev) {
		that.doOnColumnClick(ev);
	});
}

// Returns html element itself
jCVL_Column.prototype.get = function () {
	return this.elem;
}

// Appends element to given one
jCVL_Column.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.elem);
}

// Creates new ColumnItem with 'text' label
jCVL_Column.prototype._createItem = function (index, text, value) {
	var id = this.id + '-item' + this.items.length;
	var item = new jCVL_ColumnItem({ 
		id:          id, 
		text:        text, 
		value:       value, 
		parentCol:   this, 
		childrenNum: this.data[index].data.length,
		textFormat:           this.opts.textFormat,
		childrenCountFormat:  this.opts.childrenCountFormat,
		emptyChildrenCounter: this.opts.emptyChildrenCounter,
	});
	var that = this;
	item.setOnClick(function (ev, item) { that.onItemClick(ev, index, item); });
	item.setOnCheckboxClick(function (ev, item) { that.onItemCheckboxClick(ev, index, item); });
	return item;
}

// Removes column items. If bTotal is set also clears parent* and data
jCVL_Column.prototype.clear = function (bTotal) {
	this.elem.find('div').remove();
	this.items = [];
	this.curItem = undefined;
	this.curItemIndex = -1;
	if (!!bTotal)
	{
		this.parentCol = this.parentText = this.parentValue = undefined;
		this.data  = [];
	}
}

// Creates and adds elements from data
jCVL_Column.prototype._fillItems = function (data) {
	var that = this;
	this.clear();
	jQuery.each(data, function (index, d) {
		var item = that._createItem(index, d.name, d.value);
		that.items.push(item);
		item.setFullPath(that.getFullPath(index));
		item.appendTo(that.elem);
	});
}

// Sets new data for column
jCVL_Column.prototype.setData = function (data, parentItem) {
	this.data        = data;
	this.parentItem  = (parentItem) ? parentItem : undefined;
	this.parentText  = (parentItem) ? parentItem.getText() : undefined;
	this.parentValue = (parentItem) ? parentItem.getValue() : undefined;
	this._fillItems(this.data);
}

jCVL_Column.prototype.doOnColumnClick = function (ev) {
	this.onColumnClick(ev);
}

// Change selected state of column items and call client's onClick handler
jCVL_Column.prototype.onItemClick = function (ev, index, item) {
	if (this.curItem && this.curItem != item)
		this.curItem.setSelected(false);
	this.curItem = item;
	this.curItemIndex = index;

	this.onClick(ev, index, item);
}

// Calls client's handler
jCVL_Column.prototype.onItemCheckboxClick = function (ev, index, item) {
	this.onCheckboxClick(ev, index, item);
}

// Gets current item/index 
jCVL_Column.prototype.getSelectedItem = function () { return this.curItem; }
jCVL_Column.prototype.getSelectedIndex = function () { return this.curItemIndex; }

jCVL_Column.prototype.getCheckedItems = function () {
	var items = [];
	for (var i=0; i<this.items.length; i++)
		if (this.items[i].isChecked())
			items.push(this.items[i]);
	return items;
}

// Gets/Sets parent item and text
jCVL_Column.prototype.getParentItem  = function () { return this.parentItem; }
jCVL_Column.prototype.getParentText  = function () { return this.parentText; }
jCVL_Column.prototype.getParentValue = function () { return this.parentValue; }

jCVL_Column.prototype.setParentItem = function (item) {
	if (item)
	{
		this.parentItem  = item;
		this.parentText  = item.getText();
		this.parentValue = item.getValue();
	}
}

// Return array of items' text
jCVL_Column.prototype.getItemsString = function (bTextOrValue) {
	var str = [];
	jQuery.each(this.items, function (index, item) { str.push(!!bTextOrValue ? item.getText() : item.getValue()); });
	return str;
}

// Returns full string from index to root column item
// If defined toColumnIndex search will be stopped at column with such index
jCVL_Column.prototype.getFullPath = function (index, toLevel_CurrentIndex, toLevel_ColumnIndex) {
	var str = [];
	
	var curLevel = toLevel_CurrentIndex || -1;
	var toLevel  = toLevel_ColumnIndex  || -1;

	if (index >= 0 && index < this.items.length)
	{
		var curIt = this.items[index];
		str.push({ text: curIt.getText(), value: curIt.getValue(), hasChildren: this.itemHasChildren(index) });
		var p = this.getParentItem();
		while (p && (curLevel == -1 || --curLevel >= toLevel))
		{
			var pCol = p.getParentColumn();
			str.push({ text: p.getText(), value: p.getValue(), hasChildren: pCol.itemHasChildren(pCol.getItemIndex(p.getValue())) });
			p = pCol.getParentItem();
		}
	}

	return str.reverse();
}

// Returns array of full pathes of checked items
jCVL_Column.prototype.getFullCheckedPathes = function () {
	var pathes = [];
	var items  = this.getCheckedItems();
	for (var i=0; i<items.length; i++)
		pathes.push(items[i].getFullPath());
	return pathes;
}

// Gets item and item data
jCVL_Column.prototype.getItem = function (index) {
	return (index >= 0 && index < this.items.length) ? this.items[index] : undefined;
}

// Returns index of item by value
jCVL_Column.prototype.getItemIndex = function (value) {
	var index = null;
	for (var i=0; i<this.items.length && index == null; i++)
		if (this.items[i].getValue() == value)
			index = i;
	return index;
}

// Returns item data
jCVL_Column.prototype.getItemData = function (index) {
	return (index >= 0 && index < this.items.length) ? this.data[index].data : [];
}

// Returns true if 'index' item has children
jCVL_Column.prototype.itemHasChildren = function (index) {
	return (index >= 0 && index < this.items.length) && this.data[index].hasChildren;
}

// Returns true if any of items has children
jCVL_Column.prototype.hasChildren = function () {
	var has = false;
	var that = this;
	jQuery.each(this.items, function (index, item) { if (that.data[index].hasChildren) has = true; });
	return has;
}

jCVL_Column.prototype.setSimpleMode = function (bMode) {
	this.simpleMode = !!bMode;
}

jCVL_Column.prototype.getSimpleMode = function () {
	return this.simpleMode;
}

jCVL_Column.prototype.isVisible = function () {
	return this.elem.is(':visible');
}

// Hides column (if !simple - with animation)
jCVL_Column.prototype.hide = function (cb) {
	this.setWidth(this.opts.defWidth);
	if (!!this.simpleMode)
	{
		this.elem.hide();
		if (cb)
			cb();
	}
	else if (this.elem.is(':visible'))
		this.elem.animate({ width: 'hide' }, 'fast', function () { if (cb) cb(); });
}

// Shows column
jCVL_Column.prototype.show = function (cb) {
	// reset width
	if (!!this.simpleMode)
	{
		this.elem.show();
		if (cb)
			cb();
	}
	else if (!this.elem.is(':visible'))
		this.elem.animate({ width: 'show' }, 'fast', function () { if (cb) cb(); });
}

// Sets checkbox state for all items
jCVL_Column.prototype.checkAll = function (bCheck) {
	jQuery.each(this.items, function (index, item) {
		item.setChecked(!!bCheck);
	});
}

// Sets/Gets width
jCVL_Column.prototype.getWidth = function () {
	return this.opts.width;
}

jCVL_Column.prototype.getMinWidth = function () {
	return this.opts.minWidth;
}

jCVL_Column.prototype.getMaxWidth = function () {
	return this.opts.maxWidth;
}

jCVL_Column.prototype.setWidth = function (w) {
	var width = parseInt(w);
	this.opts.width = CVL_AdjustMinMax(width, this.opts.minWidth, this.opts.maxWidth);
	this.elem.css({ width: this.opts.width });
}

jCVL_Column.prototype.getFullWidth = function () {
	return this.elem.outerWidth(true);
}

jCVL_Column.prototype.updateItems = function () {
	jQuery.each(this.items, function (index, item) {
		item.updateItem();
	});
}

// Set/Get formats
// Set* functions update item
jCVL_Column.prototype.setTextFormat = function (fmt) {
	jQuery.each(this.items, function (index, item) {
		item.setTextFormat(fmt);
	});
}

jCVL_Column.prototype.setChildrenCountFormat = function (fmt) {
	jQuery.each(this.items, function (index, item) {
		item.setChildrenCountFormat(fmt);
	});
}

jCVL_Column.prototype.setEmptyChildrenCounter = function (bShow) {
	jQuery.each(this.items, function (index, item) {
		item.setEmptyChildrenCounter(bShow);
	});
}


// -----------------------------------------------------------------------------
// ColumnSplitter
//
function jCVL_ColumnSplitter(opts)
{
	var defOpts = {
		width:    4,
		height:   200,
		doLeft:   false,
		doRight:  false,
		// modify only left column
		leftMode: false,
		leftCol:  null,
		rightCol: null,
		parent:   null
	};
	this.opts = jQuery.extend(defOpts, opts);
	
	this.elem = $('<div>')
		.attr('class', 'cvl-column-splitter')
		.css({ width: this.opts.width, height: this.opts.height });

	if (this.opts.parent)
	{
		this.parentEl = $(this.opts.parent.get());
		if (this.opts.leftCol || this.opts.rightCol)
		{
			this.opts.doLeft  = !!this.opts.leftCol;
			this.opts.doRight = !this.leftMode && !!this.opts.rightCol;
			this._bindMouseDown();
		}
	}

	this.lastPos = 0;
	this.pressed = false;
}

// Returns html element itself
jCVL_ColumnSplitter.prototype.get = function () {
	return this.elem;
}

// Appends element to given one
jCVL_ColumnSplitter.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.elem);
}

// Set height equal to left column heigh
jCVL_ColumnSplitter.prototype.adjustHeight = function () {
	this.elem.height($(this.opts.leftCol.get()).outerHeight(true));
}

jCVL_ColumnSplitter.prototype.getFullWidth = function () {
	return this.elem.outerWidth(true);
}

jCVL_ColumnSplitter.prototype.isVisible = function () {
	return this.elem.is(':visible');
}

// Show/hide
jCVL_ColumnSplitter.prototype.show = function () {
	this.elem.show();
	this.adjustHeight();
}

jCVL_ColumnSplitter.prototype.hide = function () {
	this.elem.hide();
}

// Sets height of element
jCVL_ColumnSplitter.prototype.setHeight = function (h) {
	this.elem.height(h);
}

// Sets mode of modifying
jCVL_ColumnSplitter.prototype.setLeftMode = function (lm) {
	this.opts.doRight  = !(this.opts.leftMode = !!lm) && this.opts.rightCol; // set mode and change doRight
}

// Sets doLeft/doRight
jCVL_ColumnSplitter.prototype.setDoLeft = function (d) {
	this.opts.doLeft = !!d;
}

jCVL_ColumnSplitter.prototype.setDoRight = function (d) {
	this.opts.doRight = !!d;
}

jCVL_ColumnSplitter.prototype.setLeftColumn = function (col) {
	this.opts.leftCol = col;
	this.opts.doLeft  = !!this.opts.leftCol;
}

jCVL_ColumnSplitter.prototype.setRightColumn = function (col) {
	this.opts.rightCol = col;
	this.opts.doRight  = !this.opts.leftMode && !!this.opts.rightCol;
}

jCVL_ColumnSplitter.prototype._bindMouseDown = function () {
	var that = this;
	this.elem.mousedown(function (event) { that.onMouseDown(event); });
}

jCVL_ColumnSplitter.prototype._bindMouseEvents = function () {
	var that = this;
	this.elem.addClass('cvl-column-splitter-active');
	this.parentEl
		.bind('mousemove',  function (event) { that.onMouseMove(event); })
		.bind('mouseleave', function (event) { that.onMouseUpOut(event); })
		.bind('mouseup',    function (event) { that.onMouseUpOut(event); });
}

jCVL_ColumnSplitter.prototype._unbindMouseEvents = function () {
	var that = this;
	this.elem.removeClass('cvl-column-splitter-active');
	this.parentEl
		.unbind('mousemove',  function (event) { that.onMouseMove(event); })
		.unbind('mouseleave', function (event) { that.onMouseUpOut(event); })
		.unbind('mouseup',    function (event) { that.onMouseUpOut(event); });
}

// Mouse handlers
jCVL_ColumnSplitter.prototype.onMouseDown = function (ev) {
	ev.stopPropagation();
	ev.preventDefault();
	this.pressed = true;
	this.lastPos = ev.pageX;
	this._bindMouseEvents();
}

// Changes size of columns depends on the parameters
jCVL_ColumnSplitter.prototype.onMouseMove = function (ev) {
	if (this.pressed)
	{
		// get direction
		var pos       = ev.pageX;
		var delta     = Math.abs(this.lastPos - pos);
		var lColWidth = this.opts.leftCol.getWidth();
		var rColWidth = this.opts.rightCol.getWidth();
		var lNew = lColWidth, rNew = rColWidth;
	
		// to left
		if (pos < this.lastPos)
		{
			if (this.opts.doLeft && lColWidth - delta >= this.opts.leftCol.getMinWidth())
			{
				lNew = lColWidth - delta;
				// Change right size only if left has been changed
				if (this.opts.doRight && rColWidth + delta <= this.opts.rightCol.getMaxWidth())
					rNew = rColWidth + delta;
			}
		}
		// to right
		else if (pos > this.lastPos)
		{
			if (this.opts.doLeft && lColWidth + delta <= this.opts.leftCol.getMaxWidth())
			{
				lNew = lColWidth + delta;
				// Change left size only if right has been changed
				if (this.opts.doRight && rColWidth - delta >= this.opts.rightCol.getMinWidth())
					rNew = rColWidth - delta;
			}
		}
		
		var parentWidth  = this.opts.parent._calculateWidth();
		parentWidth     += lNew - lColWidth + rNew - rColWidth;

		this.opts.parent._updateWidth(parentWidth);
		this.opts.leftCol.setWidth(lNew);
		this.opts.rightCol.setWidth(rNew)
		
		this.lastPos = pos;
	}
}

jCVL_ColumnSplitter.prototype.onMouseUpOut = function (ev) {
	this.pressed = false;
	this._unbindMouseEvents();
}


// -----------------------------------------------------------------------------
// ColumnList
//
function jCVL_ColumnList (opts)
{
	var defOpts = {
		height:           200,
		columnWidth:      150,
		columnMargin:     10,
		columnNum:        3,
		columnMinWidth:   150,
		columnMaxWidth:   250,
		id:               '',
		data:             [],
		useSplitters:     true,
		splitterLeftMode: false,
		onClick:          function () {},
		onCheckboxClick:  function () {},
		textFormat:           jCVL_ColumnItemTags.text,
		childrenCountFormat:  null,
		emptyChildrenCounter: false
	};
	this.opts = jQuery.extend(defOpts, opts);
	this.cols = [];
	this.spls = [];
	this.data = this.opts.data;
	
	this.wrapper = $('<div>')
		.attr('id', this.opts.id + '-wrapper')
		.attr('class', 'cvl-column-list-wrapper')
		.css({ 
			'overflow-x': 'auto',
			'padding':    0,
			'position':   'relative'
		});
	this.elem = $('<div>')
		.attr('id', this.opts.id)
		.attr('class', 'cvl-column-list');
	
	this.wrapper.append(this.elem);
	this._createColumns();
}

// Returns html element itself
jCVL_ColumnList.prototype.get = function () {
	return this.wrapper;
}

// Appends element to given one
jCVL_ColumnList.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
		$(elem).append(this.wrapper);
}

jCVL_ColumnList.prototype.getColumn = function (index) {
	return (index >= 0 && index < this.cols.length) ? this.cols[index] : undefined;
}

jCVL_ColumnList.prototype._createColumns = function () {
	var that = this;
	var colMargin = this.opts.useSplitters ? 0 : this.opts.columnMargin;

	for (var i=0; i<this.opts.columnNum; i++)
	{
		var colId = this.opts.id + '-col' + i;
		var col = new jCVL_Column({
			width:     this.opts.columnWidth,
			height:    this.opts.height,
			margin:    colMargin,
			minWidth:  this.opts.columnMinWidth,
			maxWidth:  this.opts.columnMaxWidth,
			id:        colId,
			// Bind current i value to colIndex 
			onClick:  (function (colIndex) { return function (ev, index, item) { 
				that.onColumnItemClick(ev, colIndex, index, item); }; })(i),
			onCheckboxClick: (function (colIndex) { return function (ev, index, item) { 
				that.onColumnItemCheckboxClick(ev, colIndex, index, item); }; })(i),
			onColumnClick: (function (colIndex) { return function (ev) {
				that.onColumnClick(ev, colIndex); }; })(i),
			textFormat:           this.opts.textFormat,
			childrenCountFormat:  this.opts.childrenCountFormat,
			emptyChildrenCounter: this.opts.emptyChildrenCounter
		});
		col.setSimpleMode(true);
		col.appendTo(this.elem);
		if (i > 0)
			col.hide();
		else if (this.data.length)
			col.setData(this.data);
		this.cols.push(col);
		col.setSimpleMode(false);

		if (this.opts.useSplitters)
		{
			var leftCol  = col;
			var rightCol = null;
			var spl = new jCVL_ColumnSplitter({
				width:    4,
				height:   this.opts.height,
				leftCol:  leftCol,
				rightCol: rightCol,
				parent:   this,
				leftMode: this.opts.splitterLeftMode
			});
			spl.appendTo(this.elem);
			this.spls.push(spl);
			
			// Setup right column for previous splitter
			if (i > 0)
			{
				spl.hide(); // hide splitter except first
				this.spls[i - 1].setRightColumn(leftCol);
			}
		}
	}
}

// Resize elements if needed
jCVL_ColumnList.prototype.adjustElements = function () {
	this._updateWidth();

	if (this.opts.useSplitters)
		jQuery.each(this.spls, function (i, s) { s.adjustHeight(); });
}

jCVL_ColumnList.prototype.clear = function () {
	jQuery.each(this.cols, function (index, item) { item.clear(); if (index > 0) item.hide(); });
	this._updateWidth();
}

jCVL_ColumnList.prototype.onColumnClick = function (ev, colIndex) {
	var col       = this.cols[colIndex];
	var wrapWidth = this.wrapper.outerWidth();
	var scrLeft   = this.wrapper.scrollLeft();
	var colLeft   = col.get().position().left;
	var colRight  = colLeft + col.getFullWidth();

	if (this.opts.useSplitters)
		colRight += this.spls[colIndex].getFullWidth();

	var scrl = null;
	if (colLeft < 0)
	{
		scrl = scrLeft - Math.abs(colLeft);
		// If not first column, show part of previous
		if (colIndex > 0)
		{
			var lim = 12 + (this.opts.useSplitters ? this.spls[colIndex - 1].getFullWidth() : 0);
			if (scrl > lim)
				scrl -= lim;
		}
	}
	else if (colRight > wrapWidth)
	{
		scrl = scrLeft + colRight - wrapWidth;
		// If not last column, show part of next
		if (colIndex < this.cols.length - 1)
			scrl += 12 + (this.opts.useSplitters ? this.spls[colIndex + 1].getFullWidth() : 0);
	}

	if (scrl != null)
		this.wrapper.animate({ scrollLeft: scrl }, 'fast');
}

jCVL_ColumnList.prototype.onColumnItemClick = function (ev, colIndex, itemIndex, item) {
	var that = this;
	var bEx = true;
	if (colIndex < this.cols.length - 1)
	{
		jQuery.each(this.cols, function (index, col) { 
			if (index > colIndex) 
			{
				var m = col.getSimpleMode();
				col.setSimpleMode(true);
				col.hide();
				col.setSimpleMode(m);
				if (that.opts.useSplitters)
					that.spls[index].hide();
			}
		});
		
		if (this.cols[colIndex].itemHasChildren(itemIndex))
		{
			var nextCol = this.cols[colIndex + 1];
			nextCol.clear();
			// Adjust width of wrapper
			var newWidth = this._calculateWidth() + nextCol.getFullWidth();
			if (this.opts.useSplitters)
				newWidth += this.spls[colIndex + 1].getFullWidth();
			this._updateWidth(newWidth);

			nextCol.show(function () {
				nextCol.setData(that.cols[colIndex].getItemData(itemIndex));
				nextCol.setParentItem(item);
				that.opts.onClick(ev, colIndex, itemIndex, item);
				
				if (that.wrapper.width() < that._calculateWidth())
					that.wrapper.animate({ scrollLeft: that._calculateWidth() - that.wrapper.width() }, 'fast');
			});
			if (this.opts.useSplitters)
				this.spls[colIndex + 1].show();
			bEx = false;
		}
		else // no children
		{
			that._updateWidth();
			
			var scrl        = null;
			var col         = this.cols[colIndex];
			var colLeft     = col.get().position().left;
			var colRight    = colLeft + col.getFullWidth();
			var wrapWidth   = this.wrapper.outerWidth();
			var scrLeft     = this.wrapper.scrollLeft();

			if (this.opts.useSplitters)
				colRight += this.spls[colIndex].getFullWidth();

			if (colLeft < 0)
				scrl = Math.abs(colLeft);
			else if (colRight > wrapWidth)
				scrl = scrLeft + colRight - wrapWidth;
			
			if (scrl != null)
				this.wrapper.animate({ scrollLeft: scrl }, 'fast');
		}
	}

	if (bEx)
		this.opts.onClick(ev, colIndex, itemIndex, item);
}

// Fire item's onClick event
jCVL_ColumnList.prototype.fireColumnItemClick = function (colIndex, itemIndex)
{
	if (colIndex >= 0 && colIndex < this.cols.length)
	{
		var col = this.cols[colIndex];
		if (itemIndex >= 0 && itemIndex < col.items.length)
			col.getItem(itemIndex).fireOnClick();
	}
}

// Sets/Gets data
jCVL_ColumnList.prototype.setData = function (data) {
	this.clear();
	this.data = data;
	this.cols[0].setData(this.data);
}

jCVL_ColumnList.prototype.getData = function () {
	return this.data;
}

// Checks all items in path to root or remove checks at all children
jCVL_ColumnList.prototype.onColumnItemCheckboxClick = function (ev, colIndex, itemIndex, item) {
	if (item.isChecked())
	{
		// Check items in path to root
		var it = item.getParentColumn().getParentItem();
		while (it)
		{
			it.setChecked(true);
			it = it.getParentColumn().getParentItem();
		}
		
		// Call after
		this.opts.onCheckboxClick(ev, colIndex, itemIndex, item);
	}
	else // Uncheck all items in child columns
	{
		// Call before
		this.opts.onCheckboxClick(ev, colIndex, itemIndex, item);

		if (item == this.getColumn(colIndex).getSelectedItem())
			for (var i=colIndex+1; i<this.cols.length; i++)
				this.cols[i].checkAll(false);
	}
}

jCVL_ColumnList.prototype.setSplitterLeftMode = function (lMode) {
	jQuery.each(this.spls, function (index, item) {
		item.setLeftMode(!!lMode);
	});
}

jCVL_ColumnList.prototype.checkAll = function (bCheck) {
	jQuery.each(this.cols, function (index, col) {
		col.checkAll(!!bCheck);
	});
}

// Calculate width of all visilbe elements
jCVL_ColumnList.prototype._calculateWidth = function () {
	var w = 0;
	jQuery.map(jQuery.merge(jQuery.merge([], this.cols), this.spls), function (elem, i) {
		if (elem.isVisible())
			w += elem.getFullWidth();
	});
	return w;
}

// Set width of inner element to passed or calculated value 
jCVL_ColumnList.prototype._updateWidth = function (w) {
	var width = typeof(w) == "number" ? w : this._calculateWidth();
	this.elem.width(width);
}

// Search for data item by path
jCVL_ColumnList.prototype._getDataItemByPath = function (path) {
	var p;
	var d = this.data; 
	while (p = path.shift())
	{
		for (var i=0; i<d.length; i++)
			if (d[i].value == p.value)
			{
				d = d[i].data;
				break;
			}
	}
	return d;
}

jCVL_ColumnList.prototype.updateItems = function () {
	jQuery.each(this.cols, function (index, col) {
		col.updateItems();
	});
}


// -----------------------------------------------------------------------------
// Column List View
//
function jCVL_ColumnListView(opts) 
{
	var defOpts = {
		id:               'col-list-view',
		columnWidth:      150,
		columnHeight:     200,
		columnMargin:     10,
		columnNum:        3,
		columnMinWidth:   150,
		columnMaxWidth:   250,
		useSplitters:     true,
		splitterLeftMode: false,
		paramName:        'columnview[]',
		elementId:        '',
		removeULAfter:    false,
		showLabels:       true,
		leafMode:         false,
		textFormat:           jCVL_ColumnItemTags.text,
		childrenCountFormat:  null,
		emptyChildrenCounter: false
	};
	this.opts = jQuery.extend(defOpts, opts);
	var that = this;
	
	this.elem = $('<div>')
		.attr('id', this.opts.id)
		.attr('class', 'cvl-column-list-view');
	
	var listOpts = this.opts;
	listOpts.id              = this.opts.id + '-column-list';
	listOpts.onClick         = function (ev, ci, ii, it) { that.onColumnItemClick(ev, ci, ii, it); };
	listOpts.onCheckboxClick = function (ev, ci, ii, it) { that.onColumnItemCheckboxClick(ev, ci, ii, it); };
	listOpts.height          = this.opts.columnHeight;
	this.list = new jCVL_ColumnList(listOpts);
	
	this.jaws = new jCVL_JawArea({
		id:             this.opts.id + '-jaws-area',
		unique:         true,
		paramName:      this.opts.paramName,
		onDelClick:     function (ev, id, text, value) { that.onJawDelClick(ev, id, text, value); },
		onNameClick:    function (ev, id, text, value) { that.onJawNameClick(ev, id, text, value); }
	});
	this.labels = {};
	
	this.list.appendTo(this.elem);
	this.jaws.appendTo(this.elem);
	
	if (!this.opts.showLabels)
		this.jaws.hide();
	
	if (this.opts.elementId != '')
		this.setFromElement(this.opts.elementId, !!this.opts.removeULAfter);
}

// Returns html element itself
jCVL_ColumnListView.prototype.get = function () {
	return this.elem;
}

// Appends element to given one
jCVL_ColumnListView.prototype.appendTo = function (elem) {
	if ($(elem).length != 0)
	{
		$(elem).append(this.elem);
		this.list.adjustElements();
	}
}

// Calls children's adjustElement() function
jCVL_ColumnListView.prototype.adjustElements = function () {
	this.list.adjustElements();
}

// Returns jCVL_ColumnList object
jCVL_ColumnListView.prototype.getColumnList = function () {
	return this.list;
}

jCVL_ColumnListView.prototype._clear = function () {
	this.list._clear();
}

jCVL_ColumnListView.prototype.setSingleCheck = function (bMode) {
	this.opts.singleCheck = !!bMode;
}

// Set up list view from data list stoted in <UL> on page
jCVL_ColumnListView.prototype.setFromElement = function (elem_id, bRemoveListAfter) {
	var ul = typeof(elem_id) == 'string' ? $('#' + elem_id) : $(elem_id);
	if (ul.length == 0)
	{
		if (console)
			console.error('jColumnListView: Element with ID "' + elem_id + '" was not found');
	}
	else if (!ul.is('ul'))
	{
		if (console)
			console.error('jColumnListView: Element with ID "' + elem_id + '" is not <UL> element');
	}
	else
	{
		var data = this._parseData(ul);
		this.list.setData(data);
		if (!!bRemoveListAfter)
			ul.remove();
	}
}

// Parses <UL> list and retuns data
jCVL_ColumnListView.prototype._parseData = function (ul_elem, data) {
	if (!data)
		data = [];

	var that = this;
	$(ul_elem).children('li').each(function (index, item) {
		var name  = $.trim($($(item).contents()[0]).text());
		var value = $(item).attr('itemValue') || name;
		var childrenData = [];
		var ulChild = $(item).children('ul');
		if (ulChild.length)
			that._parseData(ulChild[0], childrenData);

		data.push({ name: name, value: value, data: childrenData, hasChildren: childrenData.length != 0 });
	});
	
	return data;
}

// Shows next column if exists and update it with selected items
jCVL_ColumnListView.prototype.onColumnItemClick = function (event, colIndex, itemIndex, item) {
	var aKeys = function (obj) {
		var keys = [];
		for(i in obj) 
			if (obj.hasOwnProperty(i))
				keys.push(i);
		return keys;
	};

	// Check items in the next column if we have it in jaws
	var nextCol = (colIndex + 1 < this.opts.columnNum) ? this.list.getColumn(colIndex + 1) : undefined;
	if (nextCol)
	{
		var jaws  = aKeys(this.labels);
		var items = nextCol.getItemsString();
		jQuery.each(items, function (index, item) {
			if (jQuery.inArray(item, jaws) > -1)
				nextCol.getItem(index).setChecked(true);
		});
	}
}

// Updates labels depends on new selected items
jCVL_ColumnListView.prototype.onColumnItemCheckboxClick = function (event, colIndex, itemIndex, item) {
	var that = this;
	if (item.isChecked())
	{
		if (this.opts.singleCheck)
		{
			// Leave only current checked item
			this.uncheckAll();
			var it = item;
			for ( ; it; it = it.getParentColumn().getParentItem())
				it.setChecked(true);
		}
		
		// Get path to root column ([ { text, value }, ... ])
		var labs = this.list.getColumn(colIndex).getFullPath(itemIndex);
		// Store labels and update jaws
		jQuery.each(labs, function (index, item) {
			if (typeof(that.labels[item.value]) == 'undefined')
			{
				that.labels[item.value] = 1;
				if (!that.opts.leafMode || !item.hasChildren)
					that.jaws.addJaw(item.text, item.value);
			}
			else
				that.labels[item.value]++;
		});
	}
	else
	{
		// Uncheck current and all checked children items if current item equal to selected
		var rems = [];
		
		// Find current item in data tree
		var col  = this.list.getColumn(colIndex);
		var path = col.getFullPath(itemIndex);
		var data = this.list._getDataItemByPath(path);
		
		// Collect all children items using data hash
		var getChildren = function (pData, chld) {
			jQuery.each(pData, function (index, item) {
				if (item.hasChildren)
					getChildren(item.data, chld);
				chld.push(item.value);
			});
		};
		getChildren(data, rems);
		// Remove current item's label too
		rems.push(item.getValue());
		
		// Remove collected items
		jQuery.each(rems, function (index, item) {
			// remove by value
			if (typeof(that.labels[item]) != 'undefined')
			{
				that.jaws.delJaw(item);
				delete that.labels[item];
			}
		});
	}
}

// Returns path to given element in array, where array index is colIndex and array value is itemIndex
jCVL_ColumnListView.prototype._findListItemPath = function (data, value) {
	var path_to_col = [];

	// Traverse tree in postorder
	var findLevel = function (data) {
		var ret = -1;
		for (var i=0; i<data.length; i++)
		{
			if (data[i].hasChildren && findLevel(data[i].data) >= 0 || data[i].value == value)
			{
				path_to_col.push(ret = i);
				break;
			}
		}
		return ret;
	}

	findLevel(data);
	
	return path_to_col.reverse();
}

jCVL_ColumnListView.prototype._selectColumnItemByPath = function (col, ptc, cb) {
	var that = this;

	for (var colIndex = col; colIndex < this.opts.columnNum && ptc.length; colIndex++)
	{
		var oldMode, hasNext = colIndex + 1 < this.opts.columnNum;
		if (hasNext)
		{
			var nextCol = this.list.getColumn(colIndex + 1);
			oldMode = nextCol.getSimpleMode();
			nextCol.setSimpleMode(true);
		}
		this.list.getColumn(colIndex).getItem(ptc.shift()).fireOnClick();
		if (hasNext)
			this.list.getColumn(colIndex + 1).setSimpleMode(oldMode);
	}

	if (cb)
		cb();
}

jCVL_ColumnListView.prototype.onJawDelClick = function (event, id, text, value) {
	var ptc  = this._findListItemPath(this.list.getData(), value);
	var col  = ptc.length - 1;
	var itm  = ptc[ptc.length - 1];
	var that = this;
	if (ptc.length)
		this._selectColumnItemByPath(0, ptc, function () {
			var item = that.list.getColumn(col).getItem(itm);
			item.setChecked(false);
			that.list.onColumnItemCheckboxClick(null, col, itm, item);
		});
}

jCVL_ColumnListView.prototype.onJawNameClick = function (event, id, text, value) {
	var ptc = this._findListItemPath(this.list.getData(), value);
	if (ptc.length)
		this._selectColumnItemByPath(0, ptc);
}

// Sets given items checked (by value!)
jCVL_ColumnListView.prototype.setValues = function (vals) {
	var that = this;
	var data = this.list.getData();
	jQuery.each(vals, function (index, val) {
		var path = that._findListItemPath(data, val);
		var col  = path.length - 1;
		var itm  = path[path.length - 1];
		if (path.length)
			that._selectColumnItemByPath(0, path, function () {
				var item = that.list.getColumn(col).getItem(itm);
				item.setChecked(true);
				that.list.onColumnItemCheckboxClick(null, col, itm, item);
			});
	});
}

jCVL_ColumnListView.prototype.uncheckAll = function () {
	this.list.checkAll(false);
	this.jaws.clear();
	this.labels = {};
}

// Call updateItem for each item in list
jCVL_ColumnListView.prototype.updateItems = function () {
	this.list.updateItems();
}




/* -----------------------------------------------------------------------------
 * jColumnListView
 * 
 * See description on the top of file
 */
jQuery.fn.jColumnListView = function (options) {
	var defOpts = {
		id:               'col-list-view',
		columnWidth:      150,
		columnHeight:     200,
		columnMargin:     10,
		columnNum:        3,
		columnMinWidth:   150,
		columnMaxWidth:   250,
		useSplitters:     true,
		splitterLeftMode: false,
		paramName:        'columnview',
		elementId:        '',
		appendToId:       '',
		removeULAfter:    false,
		showLabels:       true,
		singleCheck:      false,
		leafMode:         false,
		textFormat:           jCVL_ColumnItemTags.text,
		childrenCountFormat:  null,
		emptyChildrenCounter: false
	};
	var opts = $.extend(defOpts, options);

	this.cvl = new jCVL_ColumnListView(opts);
	if (opts.appendToId != '')
	{
		this.cvl.appendTo($('#' + opts.appendToId));
		this.cvl.adjustElements();
	}
	
	return this.cvl;
};

// Returns ColumnListView object
jQuery.fn.jColumnListView.prototype.get = function () {
	return this.cvl;
}

// Appends element to given one
jQuery.fn.jColumnListView.prototype.appendTo = function (elem) {
	this.cvl.appendTo(elem);
}
