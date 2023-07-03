import { ApolloQueryResult, useApolloClient } from "@apollo/client";
import {
  _GetChannelOperandsDocument,
  _GetChannelOperandsQuery,
  _GetChannelOperandsQueryVariables,
  _SearchAttributeOperandsDocument,
  _SearchAttributeOperandsQuery,
  _SearchAttributeOperandsQueryVariables,
  _SearchCategoriesOperandsDocument,
  _SearchCategoriesOperandsQuery,
  _SearchCategoriesOperandsQueryVariables,
  _SearchCollectionsOperandsDocument,
  _SearchCollectionsOperandsQuery,
  _SearchCollectionsOperandsQueryVariables,
  _SearchProductTypesOperandsDocument,
  _SearchProductTypesOperandsQuery,
  _SearchProductTypesOperandsQueryVariables,
} from "@dashboard/graphql";
import { useEffect, useState } from "react";

import { createOptionsFromAPI } from "./Handler";
import { InitialStateResponse } from "./InitialStateResponse";

interface Props {
  category?: string[];
  collection?: string[];
  channel?: string[];
  producttype?: string[];
  attribute?: {
    [attribute: string]: string[];
  };
}

type APIResponse = ApolloQueryResult<
  | _GetChannelOperandsQuery
  | _SearchCollectionsOperandsQuery
  | _SearchCategoriesOperandsQuery
  | _SearchProductTypesOperandsQuery
  | _SearchAttributeOperandsQuery
>;

type QueriesToRun = Array<Promise<APIResponse>>;

type DataFromQueries = APIResponse[];

export const useInitialAPIState = ({
  category,
  collection,
  producttype,
  channel,
  attribute,
}: Props) => {
  const client = useApolloClient();
  const [data, setData] = useState<DataFromQueries>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queriesToRun: QueriesToRun = [];

    const fetchQueries = async () => {
      const data = await Promise.all(queriesToRun);
      setData(data);
      setLoading(false);
    };

    if (channel.length > 0) {
      queriesToRun.push(
        client.query<
          _GetChannelOperandsQuery,
          _GetChannelOperandsQueryVariables
        >({
          query: _GetChannelOperandsDocument,
        }),
      );
    }

    if (collection.length > 0) {
      queriesToRun.push(
        client.query<
          _SearchCollectionsOperandsQuery,
          _SearchCollectionsOperandsQueryVariables
        >({
          query: _SearchCollectionsOperandsDocument,
          variables: {
            collectionsSlugs: collection,
            first: collection.length,
          },
        }),
      );
    }

    if (category.length > 0) {
      queriesToRun.push(
        client.query<
          _SearchCategoriesOperandsQuery,
          _SearchCategoriesOperandsQueryVariables
        >({
          query: _SearchCategoriesOperandsDocument,
          variables: {
            categoriesSlugs: category,
            first: category.length,
          },
        }),
      );
    }

    if (producttype.length > 0) {
      queriesToRun.push(
        client.query<
          _SearchProductTypesOperandsQuery,
          _SearchProductTypesOperandsQueryVariables
        >({
          query: _SearchProductTypesOperandsDocument,
          variables: {
            productTypesSlugs: producttype,
            first: producttype.length,
          },
        }),
      );
    }

    if (Object.keys(attribute).length > 0) {
      queriesToRun.push(
        client.query<
          _SearchAttributeOperandsQuery,
          _SearchAttributeOperandsQueryVariables
        >({
          query: _SearchAttributeOperandsDocument,
          variables: {
            attributesSlugs: Object.keys(attribute),
            choicesIds: Object.values(attribute).flat(),
            first: Object.keys(attribute).length,
          },
        }),
      );
    }

    fetchQueries();
  }, []);

  function isChannelQuery(
    query: APIResponse,
  ): query is ApolloQueryResult<_GetChannelOperandsQuery> {
    return "channels" in query.data;
  }

  function isCollectionQuery(
    query: APIResponse,
  ): query is ApolloQueryResult<_SearchCollectionsOperandsQuery> {
    return "collections" in query.data;
  }

  function isCategoryQuery(
    query: APIResponse,
  ): query is ApolloQueryResult<_SearchCategoriesOperandsQuery> {
    return "categories" in query.data;
  }

  function isProductTypeQuery(
    query: APIResponse,
  ): query is ApolloQueryResult<_SearchProductTypesOperandsQuery> {
    return "productTypes" in query.data;
  }

  function isAttributeQuery(
    query: APIResponse,
  ): query is ApolloQueryResult<_SearchAttributeOperandsQuery> {
    return "attributes" in query.data;
  }

  const response = data.reduce(
    (acc, query) => {
      if (isChannelQuery(query)) {
        return {
          ...acc,
          channel: query.data.channels
            .filter(({ slug }) => channel.includes(slug))
            .map(({ id, name, slug }) => ({ label: name, value: id, slug })),
        };
      }

      if (isCollectionQuery(query)) {
        return {
          ...acc,
          collection: createOptionsFromAPI(query.data.collections.edges),
        };
      }

      if (isCategoryQuery(query)) {
        return {
          ...acc,
          category: createOptionsFromAPI(query.data.categories.edges),
        };
      }

      if (isProductTypeQuery(query)) {
        return {
          ...acc,
          producttype: createOptionsFromAPI(query.data.productTypes.edges),
        };
      }

      if (isAttributeQuery(query)) {
        return {
          ...acc,
          attribute: query.data.attributes.edges.reduce(
            (acc, { node }) => ({
              ...acc,
              [node.slug]: {
                choices: createOptionsFromAPI(node.choices.edges),
                slug: node?.slug,
                value: node?.id,
                label: node?.name,
                inputType: node?.inputType,
              },
            }),
            {},
          ),
        };
      }
    },
    {
      channel: [],
      collection: [],
      category: [],
      producttype: [],
      attribute: {},
    },
  );

  return {
    data: new InitialStateResponse(
      response.category,
      response.attribute,
      response.collection,
      response.producttype,
      response.channel,
    ),
    loading,
  };
};

function isChannelQuery(
  query: APIResponse,
): query is ApolloQueryResult<_GetChannelOperandsQuery> {
  return "channels" in query.data;
}

function isCollectionQuery(
  query: APIResponse,
): query is ApolloQueryResult<_SearchCollectionsOperandsQuery> {
  return "collections" in query.data;
}

function isCategoryQuery(
  query: APIResponse,
): query is ApolloQueryResult<_SearchCategoriesOperandsQuery> {
  return "categories" in query.data;
}

function isProductTypeQuery(
  query: APIResponse,
): query is ApolloQueryResult<_SearchProductTypesOperandsQuery> {
  return "productTypes" in query.data;
}

function isAttributeQuery(
  query: APIResponse,
): query is ApolloQueryResult<_SearchAttributeOperandsQuery> {
  return "attributes" in query.data;
}

const createInitalStateResponseFromAPI = (
  data: DataFromQueries,
  channel: string[],
) =>
  data.reduce(
    (acc, query) => {
      if (isChannelQuery(query)) {
        return {
          ...acc,
          channel: query.data.channels
            .filter(({ slug }) => channel.includes(slug))
            .map(({ id, name, slug }) => ({ label: name, value: id, slug })),
        };
      }

      if (isCollectionQuery(query)) {
        return {
          ...acc,
          collection: createOptionsFromAPI(query.data.collections.edges),
        };
      }

      if (isCategoryQuery(query)) {
        return {
          ...acc,
          category: createOptionsFromAPI(query.data.categories.edges),
        };
      }

      if (isProductTypeQuery(query)) {
        return {
          ...acc,
          producttype: createOptionsFromAPI(query.data.productTypes.edges),
        };
      }

      if (isAttributeQuery(query)) {
        return {
          ...acc,
          attribute: query.data.attributes.edges.reduce(
            (acc, { node }) => ({
              ...acc,
              [node.slug]: {
                choices: createOptionsFromAPI(node.choices.edges),
                slug: node?.slug,
                value: node?.id,
                label: node?.name,
                inputType: node?.inputType,
              },
            }),
            {},
          ),
        };
      }
    },
    {
      channel: [],
      collection: [],
      category: [],
      producttype: [],
      attribute: {},
    },
  );
