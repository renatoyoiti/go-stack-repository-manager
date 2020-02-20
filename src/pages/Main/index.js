import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List, ErrorMessage } from './styles';
import Container from '../../components/Container';

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      newRepo: '',
      repositories: [],
      loading: false,
      displayErrors: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      this.setState({
        displayErrors: true,
        errorMessage: 'Favor inserir um repositório.',
      });
      return;
    }

    const { newRepo, repositories } = this.state;

    try {
      this.setState({ loading: true });

      const repoExists = repositories.find(repo => repo.name === newRepo);

      if (repoExists) {
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        newRepo: '',
        repositories: [...repositories, data],
        displayErrors: false,
        errorMessage: '',
      });
    } catch (err) {
      this.setState({
        displayErrors: true,
        errorMessage: `${err.name}: ${err.message}`,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const {
      newRepo,
      loading,
      repositories,
      displayErrors,
      errorMessage,
    } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form
          noValidate
          className={displayErrors ? 'displayErrors' : ''}
          onSubmit={this.handleSubmit}
        >
          <input
            type="text"
            placeholder="usuario/nome_repositorio"
            value={newRepo}
            onChange={this.handleInputChange}
            required
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        {displayErrors ? <ErrorMessage>{errorMessage}</ErrorMessage> : ''}

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
