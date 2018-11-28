// maubot - A plugin-based Matrix bot system.
// Copyright (C) 2018 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import React, { PureComponent } from "react"
import { Link } from "react-router-dom"
import JSONTree from "react-json-tree"
import api from "../../api"
import Modal from "./Modal"

class LogEntry extends PureComponent {
    static contextType = Modal.Context

    renderName() {
        const line = this.props.line
        if (line.nameLink) {
            const modal = this.context
            return (
                <Link to={line.nameLink} onClick={modal.close}>
                    {line.name}
                </Link>
            )
        }
        return line.name
    }

    renderContent() {
        if (this.props.line.matrix_http_request) {
            const req = this.props.line.matrix_http_request

            return <>
                {req.method} {req.path}
                <div className="content">
                    {Object.entries(req.content).length > 0
                    && <JSONTree data={{ content: req.content }} hideRoot={true}/>}
                </div>
            </>
        }
        return this.props.line.msg
    }

    renderTime() {
        return this.props.line.time.toLocaleTimeString("en-GB")
    }

    renderLevelName() {
        return this.props.line.levelname
    }

    get unfocused() {
        return this.props.focus && this.props.line.name !== this.props.focus
            ? "unfocused"
            : ""
    }

    renderRow(content) {
        return (
            <div className={`row ${this.props.line.levelname.toLowerCase()} ${this.unfocused}`}>
                <span className="time">{this.renderTime()}</span>
                <span className="level">{this.renderLevelName()}</span>
                <span className="logger">{this.renderName()}</span>
                <span className="text">{content}</span>
            </div>
        )
    }

    renderExceptionInfo() {
        if (!api.debugOpenFileEnabled()) {
            return this.props.line.exc_info
        }
        const fileLinks = []
        let str = this.props.line.exc_info.replace(
            /File "(.+)", line ([0-9]+), in (.+)/g,
            (_, file, line, method) => {
                fileLinks.push(
                    <a href={"#/debugOpenFile"} onClick={() => {
                        api.debugOpenFile(file, line)
                        return false
                    }}>File "{file}", line {line}, in {method}</a>,
                )
                return "||EDGE||"
            })
        fileLinks.reverse()

        const result = []
        let key = 0
        for (const part of str.split("||EDGE||")) {
            result.push(<React.Fragment key={key++}>
                {part}
                {fileLinks.pop()}
            </React.Fragment>)
        }
        return result
    }

    render() {
        return <>
            {this.renderRow(this.renderContent())}
            {this.props.line.exc_info && this.renderRow(this.renderExceptionInfo())}
        </>
    }
}

class Log extends PureComponent {
    render() {
        return (
            <div className="log">
                <div className="lines">
                    {this.props.lines.map(data => <LogEntry key={data.id} line={data}
                                                            focus={this.props.focus}/>)}
                </div>
            </div>
        )
    }
}

export default Log
