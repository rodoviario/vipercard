
/* autoimport:start */
import { UI512CompStdDialogType, UI512CompStdDialog } from "../ui512/ui512compositesmodal.js";
import { UI512AutoIndent, UI512CompCodeEditor } from "../ui512/ui512compositeseditor.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */


export class UI512TestCompositesController extends UI512Controller {
    testrbExclusive = new UI512CompRadioButtonGroup("testrbExclusive");
    testrbInclusive = new UI512CompRadioButtonGroup("testrbInclusive");
    testToolbox = new UI512CompToolbox("testToolbox");
    testEditor = new UI512CompCodeEditor("testCodeEditor");
    testModalDlg = new UI512CompStdDialog("testModalDlg", this.lang);
    public init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);
        let editTextBehavior = new EditTextBehavior();
        this.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.trackKeyDown,
            BasicHandlers.basicKeyShortcuts,
            UI512TestCompositesController.respondKeyDown, // inserted before editTextBehavior so that we can recieve the "Enter" keystroke
            editTextBehavior.onKeyDown.bind(editTextBehavior),
        ];
    }

    private static respondKeyDown(c: UI512DemoComposites, root: Root, d: KeyDownEventDetails) {
        if (c.testEditor.children.length && c.currentFocus && c.testEditor.el && c.currentFocus === c.testEditor.el.id) {
            c.testEditor.respondKeydown(root, d);
        }
    }
}

export class UI512DemoComposites extends UI512TestCompositesController {
    test = new Test_DrawComposites();

    public init(root: Root) {
        super.init(root);

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        this.inited = true;
        this.test.addElements(this, clientrect);
        this.test.uicontext = true;
        let grp = this.app.getGroup("grp");

        let testBtns = ["WhichChecked", "RunTest", "DldImage", "Dlg1", "Dlg2", "DlgAsk"];
        let layoutTestBtns = new GridLayout(clientrect[0] + 10, clientrect[1] + 330, 100, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, "btn", UI512ElButton, () => {}, true, true);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoComposites.respondMouseUp);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseUp(c: UI512DemoComposites, root: Root, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === "btnDldImage") {
                c.test.runtest(root, true);
            } else if (d.elClick.id === "btnRunTest") {
                c.test.runtest(root, false);
            } else if (d.elClick.id === "btnWhichChecked") {
                console.log("Fruit: " + c.testrbExclusive.getWhichChecked(c.app));
                console.log("Food: " + c.testrbInclusive.getWhichChecked(c.app));
                console.log("Tool: " + c.testToolbox.getWhich());
            } else if (d.elClick.id === "btnDlg1") {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.answer;
                c.testModalDlg.btnlabels = ["", "", ""];
                c.testModalDlg.create(c.app, c.lang);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(root, c, c.app, n => c.gotFromDlg(n));
            } else if (d.elClick.id === "btnDlg2") {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.answer;
                c.testModalDlg.btnlabels = ["lngCh A", "lngCh B", "lngCh C"];
                c.testModalDlg.create(c.app, c.lang);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(root, c, c.app, n => c.gotFromDlg(n));
            } else if (d.elClick.id === "btnDlgAsk") {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.ask;
                c.testModalDlg.create(c.app, c.lang);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(root, c, c.app, n => c.gotFromDlg(n));
            }

            c.testrbInclusive.listenMouseUp(c.app, d);
            c.testrbExclusive.listenMouseUp(c.app, d);
            c.testToolbox.listenMouseUp(c.app, d);
        }
    }

    gotFromDlg(n: number) {
        console.log(`you clicked on choice "${this.testModalDlg.btnlabels[n]}".`);
        if (this.testModalDlg.resultText) {
            console.log(`you typed ${this.testModalDlg.resultText}`);
        }
    }
}

export class Test_DrawComposites extends Tests_BaseClass {
    uicontext = false;
    tests = [
        "callback/Test Drawing Composites",
        (root: Root, callback: Function) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawComposites(root), callback);
        },
    ];

    runtest(root: Root, dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawComposites(root));
    }

    addElements(c: UI512TestCompositesController, bounds: number[]) {
        let grp = new UI512ElGroup("grp");
        c.app.addGroup(grp);
        c.testModalDlg.labeltext = "aa";
        c.testModalDlg.translatedProvidedText = "sample input";

        // add bg
        let bg = new UI512ElButton("bg");
        grp.addElement(c.app, bg);
        bg.set("style", UI512BtnStyle.opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set("autohighlight", false);

        // add choice groups
        c.testrbExclusive.items = [["apple", "lngApple"], ["cherry", "lngCherry"], ["strawberry", "lngStrawberry"]];
        c.testrbExclusive.isExclusive = true;
        c.testrbExclusive.logicalWidth = 100;
        c.testrbExclusive.logicalHeight = 1;
        c.testrbExclusive.x = 50;
        c.testrbExclusive.y = 50;
        c.testrbExclusive.create(c.app, c.lang);
        c.testrbInclusive.items = [["fries", "lngFries"], ["hamburger", "lngHamburger"], ["soda", "lngSoda"], ["hot dog", "lngHot Dog"]];
        c.testrbInclusive.isExclusive = false;
        c.testrbInclusive.logicalWidth = 100;
        c.testrbInclusive.logicalHeight = 1;
        c.testrbInclusive.x = 50;
        c.testrbInclusive.y = 130;
        c.testrbInclusive.create(c.app, c.lang);

        // add toolbox
        const iconw = 20;
        c.testToolbox.iconsetid = "001";
        c.testToolbox.x = 50;
        c.testToolbox.y = 300;
        c.testToolbox.iconh = 22;
        c.testToolbox.widthOfIcon = function(id: string) {
            return iconw;
        };
        c.testToolbox.logicalWidth = 3 * iconw - 2;
        c.testToolbox.logicalHeight = 1;
        c.testToolbox.items = [["rectangle", 9], ["roundrect", 10], ["bucket", 11], ["cirle", 12], ["heart", 13], ["letter", 14]];
        c.testToolbox.create(c.app, c.lang);

        // add code editor
        c.testEditor.x = 200;
        c.testEditor.y = c.testrbExclusive.y;
        c.testEditor.logicalWidth = 200;
        c.testEditor.logicalHeight = 200;
        c.testEditor.autoIndent.caseSensitive = false;
        c.testEditor.autoIndent.lineContinuation = ["\\", "\xC2" /* roman logical not */];
        c.testEditor.lineCommentPrefix = "--~ ";
        c.testEditor.create(c.app, c.lang);
        c.testEditor.setCaption(c.app, 'Script "New Button"');
        c.testEditor.setContent(
            `abc
start1
start b2
on custom
end other
123 \\
456 \\
789
end custom
end b2
start b22
start
end1`.replace(/\r\n/g, "\n")
        );
    }

    drawTestCase(root: Root, testnumber: number, tmpCanvas: CanvasWrapper, w: number, h: number, i: number, complete: RenderComplete) {
        tmpCanvas.clear();
        let testc = new UI512TestCompositesController();
        testc.init(root);
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);
        testc.rebuildFieldScrollbars();

        // first pass rendering adds the scrollbars
        // don't show any borders
        testc.view.renderBorders = function() {};
        testc.needRedraw = true;
        testc.render(root, tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            // the fonts aren't loaded yet, let's wait until later
            return;
        }

        if (testnumber === 0) {
            this.drawTestCaseComposites1(root, testc);
        } else {
            this.drawTestCaseComposites2(root, testc);
        }

        // second pass rendering
        testc.view.renderBorders = function() {};
        testc.needRedraw = true;
        testc.render(root, tmpCanvas, 1, complete);
    }

    drawTestCaseComposites1(root: Root, c: UI512TestCompositesController) {
        c.testrbExclusive.setWhichChecked(c.app, ["apple"]);
        c.testrbInclusive.setWhichChecked(c.app, ["fries", "hamburger", "soda"]);
        c.setCurrentFocus(root, c.testEditor.getEl().id);
        this.simulateKey(root, c, "Home", "", false, true);
        this.simulateKey(root, c, "Enter", "", false, false);
        this.simulateKey(root, c, "ArrowRight", "", true, false);

        c.useOSClipboard = false;
        c.clipManager.simClipboard = "";
        this.simulateKey(root, c, "C", "c", false, true);
        assertEq("\n", c.clipManager.simClipboard, "1R|");
    }

    drawTestCaseComposites2(root: Root, c: UI512TestCompositesController) {
        c.testrbExclusive.setWhichChecked(c.app, ["apple"]);
        c.testrbExclusive.setWhichChecked(c.app, ["cherry"]);
        c.testrbInclusive.setWhichChecked(c.app, ["fries", "hamburger", "soda"]);
        c.testrbInclusive.setWhichChecked(c.app, ["hot dog"]);
        c.testToolbox.setWhich(c.app, "letter");
        c.setCurrentFocus(root, c.testEditor.getEl().id);
        this.simulateKey(root, c, "Home", "", false, true);
        this.simulateKey(root, c, "A", "a", false, true);
        this.simulateKey(root, c, "Backspace", "", false, false);
        this.simulateText(root, c, "on a");
        this.simulateKey(root, c, "Enter", "", false, false);
        this.simulateText(root, c, "on b");
        this.simulateKey(root, c, "Enter", "", false, false);
        this.simulateKey(root, c, "ArrowLeft", "", false, false);
        this.simulateKey(root, c, "ArrowLeft", "", false, false);
        this.simulateKey(root, c, "ArrowLeft", "", false, false);
        this.simulateKey(root, c, "Enter", "", false, false);
        this.simulateText(root, c, "end bb");
        this.simulateKey(root, c, "Enter", "", false, false);
        this.simulateKey(root, c, "ArrowRight", "", true, false);
    }

    testDrawComposites(root: Root) {
        const w = 928;
        const h = 360;
        const screensToDraw = 2;
        assertEq(w, ScreenConsts.screenwidth, "1Q|");
        let tmpCanvasDom = document.createElement("canvas");
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < screensToDraw; i++) {
                this.drawTestCase(root, i, tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(tmpCanvas.canvas, 0, 0, w, h, dest[0], dest[1], dest[0], dest[1], dest[2], dest[3]);
            }
        };

        const totalh = h * screensToDraw;
        return new CanvasTestParams("drawComposites", "/resources/test/drawcompositesexpected.png", draw, w, totalh, this.uicontext);
    }

    simulateKey(root: Root, c: UI512TestCompositesController, keyCode: string, keyChar: string, isShift: boolean, isCmd = false) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Command : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        c.rawEvent(root, d);
    }

    simulateText(root: Root, c: UI512TestCompositesController, s: string) {
        assertTrue(s.match(/^(\w| )*$/), "1P|expected only words/spaces");
        for (let chr of s) {
            this.simulateKey(root, c, chr, chr, false, false);
        }
    }
}
