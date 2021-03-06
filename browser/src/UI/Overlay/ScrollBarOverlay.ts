import * as path from "path"

import * as ReactDOM from "react-dom"
import * as _ from "lodash"

import { IOverlay, IWindowContext } from "./../OverlayManager"
import { renderBufferScrollBar, BufferScrollBarProps, ScrollBarMarker } from "./../components/BufferScrollBar"

export interface KeyToMarkers {
    [key: string]: ScrollBarMarker[]
}

export interface FileToAllMarkers {
    [filePath: string]: KeyToMarkers
}

export class ScrollBarOverlay implements IOverlay {

    private _element: HTMLElement
    private _currentFileName: string
    private _currentFileLength: number
    private _windowTop: number
    private _windowBottom: number
    private _lastWindowContext: IWindowContext
    private _lastEvent: Oni.EventContext

    private _fileToMarkers: FileToAllMarkers = {}

    public onBufferUpdate(eventContext: Oni.EventContext, lines: string[]): void {
        this._currentFileLength = lines.length
    }

    public onVimEvent(eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath

        this._lastEvent = eventContext

        const cursorMarker: ScrollBarMarker = {
            line: eventContext.line,
            height: 1,
            color: "rgb(200, 200, 200)"
        }

        this.setMarkers(<string>eventContext.bufferFullPath, "cursor", [cursorMarker])

        this._updateScrollBar()
    }

    public setMarkers(file: string, key: string, markers: ScrollBarMarker[]): void {
        const curFileToMarker = this._fileToMarkers[file] || {}
        curFileToMarker[key] = curFileToMarker[key] || []
        curFileToMarker[key] = markers
        this._fileToMarkers[file] = curFileToMarker

        this._updateScrollBar()
    }

    public update(element: HTMLElement, windowContext: IWindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._updateScrollBar()
    }

    private _updateScrollBar(): void {

        if (!this._element)
            return

        if (!this._lastEvent)
            return

        const allMarkers = this._fileToMarkers[this._lastEvent.bufferFullPath]

        const markers = _.flatten(_.values(allMarkers))

        renderBufferScrollBar({
            markers: markers,
            bufferSize: this._lastEvent.bufferTotalLines,
            windowTopLine: this._lastEvent.windowTopLine,
            windowBottomLine: this._lastEvent.windowBottomLine
        }, this._element)
    }
}
