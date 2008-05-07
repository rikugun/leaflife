package leaflife.widget.jsrpc.serializer;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;

/**
 * Convenience class for implementing serializers providing default marshall and unmarshall implementations.
 * @author huangchao
 */
public abstract class AbstractSerializer implements Serializer
{
    protected static SerializerFactory serializer_factory = SerializerFactory.getInstance();

    public Class[] getSerializableClasses()
    {
        return new Class[] {};
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        return obj.toString();
    }

    public boolean canMarshall(int level)
    {
        return level <= serializer_factory.getMaxMarshallLevel();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            return desired_class.newInstance();
        }
        catch (InstantiationException e)
        {
            throw new InvocationException("304");  // can not instantiate the specified class (nullary constructor, interface or abstract class)
        }
        catch (IllegalAccessException e)
        {
            throw new InvocationException("308");  // accessing to the the specified class is denied
        }
    }
}
