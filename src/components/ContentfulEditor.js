import React from 'react'
import styled from 'styled-components'
import * as contentful from 'contentful-management'

const Modal = styled.div`
  position: fixed;
  width: 90%;
  height: 90%;
  top: 5%;
  right: 5%;
  bottom: 5%;
  left: 5%;
  background: white;
  border: 1px solid black;
  z-index: 9999
  padding: 10px

  .close-btn {
    position: absolute
    right: 0
  }

  form {
    margin-left: auto;
    margin-right: auto;
    width: 90%

    input, textarea, label {
      display:block;
    }
    input, textarea {margin-bottom:18px;}
    input, textarea {
      width: 100%
    }
    textarea {
      height: 200px
    }
  }
`

const saveAndPublish = ({ cmaToken, fieldData, editorConfig }) => {
  const { spaceId, entityId } = editorConfig
  const client = contentful.createClient({
    accessToken: cmaToken
  })

  return client.getSpace(spaceId).then((space) => {
    return space.getEntry(entityId)
  }).then((entry) => {
    for (const field of fieldData) {
      entry.fields[field.id]['en-US'] = field.content
    }
    return entry.update()
  }).then((updatedEntry) => {
    return updatedEntry.publish()
  })
}

class EditModal extends React.Component {
  constructor (props) {
    super(props)

    const { closeModal, editorConfig, entityData } = props

    const editableFields = editorConfig.fields.filter(({ id: fieldId, type }) => {
      return entityData.hasOwnProperty(fieldId) && type !== 'Link' && type !== 'Date'// || entityData.hasOwnProperty(`${fieldId}___NODE`)
    })

    const fieldData = editableFields.map((field) => {
      const fieldData = entityData[field.id]
      if (fieldData.childMarkdownRemark) {
        return {
          id: field.id,
          content: fieldData.childMarkdownRemark.internal.content,
          type: field.type
        }
      }
      return {
        id: field.id,
        content: fieldData,
        type: field.type
      }
    })

    this.closeModal = closeModal

    this.state = {
      fieldData,
      editorConfig,
      cmaToken: '',
      errorMessage: null
    }
  }

  setField = (fieldId, content) => {
    const fields = this.state.fieldData
    const field = fields.find((field) => field.id === fieldId)
    field.content = content
    this.setState({
      fieldData: fields
    })
  }

  setCMAToken = (event) => {
    this.setState({
      cmaToken: event.target.value
    })
  }

  submitChanges = (event) => {
    event.preventDefault()

    this.setState({
      errorMessage: null
    })

    const {
      cmaToken,
      fieldData,
      editorConfig
    } = this.state

    saveAndPublish({ cmaToken, fieldData, editorConfig })
    .then(() => {
      this.closeModal()
    })
    .catch((err) => {
      this.setState({
        errorMessage: err.toString()
      })
    })
  }

  render() {
    const { closeModal } = this.props


    const editors = this.state.fieldData.map((field) => {
      if (field.type === 'Text') {
        return (
          <textarea
            key={field.id}
            value={field.content}
            onChange={(evt) => this.setField(field.id, evt.target.value)}
          />
        )
      }

      return (
        <input
          key={field.id}
          type="text"
          value={field.content}
          onChange={(evt) => this.setField(field.id, evt.target.value)}
        />
      )
    })

    return (
      <Modal>
        <button className="close-btn" onClick={closeModal}>Close</button>
        <form>
          {editors}
          <input placeholder="CMA Token" type="password" value={this.state.cmaToken} onChange={this.setCMAToken}></input>
          <button onClick={this.submitChanges}>Save</button>
        </form>
        {this.state.errorMessage ? this.state.errorMessage : ''}
      </Modal>
    )
  }
}
const EditOverlay = styled.div`
  position: relative;
`
const EditButtonSpan = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;
`

const EditButton = ({ onClick }) => (
  <EditButtonSpan>
    <button onClick={onClick}>Edit</button>
  </EditButtonSpan>
)

class ContentfulEditor extends React.Component {
  constructor() {
    super()
    this.state = {
      showModal: false
    }
  }

  editComponent = () => {
    this.setState({
      showModal: true
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  render() {
    const { contentfulEditor, children, entityData } = this.props
    const { showModal } = this.state
    const showEditButton = this.context.router.route.location.hash.includes('edit')
    return (
      <EditOverlay>
        {showEditButton && (
          <EditButton onClick={this.editComponent} />
        )}
        {showModal && (
          <EditModal
            closeModal={this.closeModal}
            editorConfig={contentfulEditor}
            entityData={entityData}
          />
        )}
        {children}
      </EditOverlay>
    )
  }
}

ContentfulEditor.contextTypes = {
  router: () => null
}

export default ContentfulEditor
