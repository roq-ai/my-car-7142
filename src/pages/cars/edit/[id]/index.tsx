import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  Center,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useFormik, FormikHelpers } from 'formik';
import { getCarById, updateCarById } from 'apiSdk/cars';
import { Error } from 'components/error';
import { carValidationSchema } from 'validationSchema/cars';
import { CarInterface } from 'interfaces/car';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { OrganizationInterface } from 'interfaces/organization';
import { getOrganizations } from 'apiSdk/organizations';

function CarEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<CarInterface>(
    () => (id ? `/cars/${id}` : null),
    () => getCarById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: CarInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateCarById(id, values);
      mutate(updated);
      resetForm();
      router.push('/cars');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<CarInterface>({
    initialValues: data,
    validationSchema: carValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Edit Car
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {formError && (
          <Box mb={4}>
            <Error error={formError} />
          </Box>
        )}
        {isLoading || (!formik.values && !error) ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="make" mb="4" isInvalid={!!formik.errors?.make}>
              <FormLabel>Make</FormLabel>
              <Input type="text" name="make" value={formik.values?.make} onChange={formik.handleChange} />
              {formik.errors.make && <FormErrorMessage>{formik.errors?.make}</FormErrorMessage>}
            </FormControl>
            <FormControl id="model" mb="4" isInvalid={!!formik.errors?.model}>
              <FormLabel>Model</FormLabel>
              <Input type="text" name="model" value={formik.values?.model} onChange={formik.handleChange} />
              {formik.errors.model && <FormErrorMessage>{formik.errors?.model}</FormErrorMessage>}
            </FormControl>
            <FormControl id="year" mb="4" isInvalid={!!formik.errors?.year}>
              <FormLabel>Year</FormLabel>
              <NumberInput
                name="year"
                value={formik.values?.year}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('year', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.year && <FormErrorMessage>{formik.errors?.year}</FormErrorMessage>}
            </FormControl>
            <FormControl id="price" mb="4" isInvalid={!!formik.errors?.price}>
              <FormLabel>Price</FormLabel>
              <NumberInput
                name="price"
                value={formik.values?.price}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('price', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.price && <FormErrorMessage>{formik.errors?.price}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<OrganizationInterface>
              formik={formik}
              name={'organization_id'}
              label={'Select Organization'}
              placeholder={'Select Organization'}
              fetcher={getOrganizations}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.name}
                </option>
              )}
            />
            <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'car',
  operation: AccessOperationEnum.UPDATE,
})(CarEditPage);
